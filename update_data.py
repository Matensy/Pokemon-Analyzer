#!/usr/bin/env python3
"""
Script para baixar e atualizar dados do Smogon Stats
Uso:
    python update_data.py                          # Baixa todos os formatos do mês mais recente
    python update_data.py gen9vgc2025regh          # Baixa formato específico
    python update_data.py gen9vgc2025regh 2024-11  # Baixa formato e mês específico
"""

import os
import sys
import json
import time
import re
import requests
from datetime import datetime

BASE_URL = "https://www.smogon.com/stats"
STATS_DIR = os.path.join(os.path.dirname(__file__), 'stats')

# Formatos principais para baixar
MAIN_FORMATS = [
    # VGC
    ('gen9vgc2025regh', [1500, 1630, 1760]),
    ('gen9vgc2025regg', [1500, 1630, 1760]),
    # Singles
    ('gen9ou', [1500, 1695, 1825]),
    ('gen9ubers', [1500, 1630, 1760]),
    ('gen9uu', [1500, 1630, 1760]),
    ('gen9ru', [1500, 1630, 1760]),
    ('gen9nu', [1500, 1630, 1760]),
    ('gen9pu', [1500, 1630, 1760]),
    ('gen9lc', [1500, 1630, 1760]),
    ('gen9monotype', [1500, 1630, 1760]),
    # Doubles
    ('gen9doublesou', [1500, 1695, 1825]),
    ('gen9doublesubers', [1500, 1630, 1760]),
    ('gen9doublesuu', [1500, 1630, 1760]),
    # National Dex
    ('gen9nationaldex', [1500, 1630, 1760]),
    ('gen9nationaldexubers', [1500, 1630, 1760]),
    # Outros
    ('gen9anythinggoes', [1500, 1630, 1760]),
    ('gen9randombattle', [1500, 1630, 1760]),
    # Legacy
    ('gen8ou', [1500, 1630, 1760]),
    ('gen7ou', [1500, 1630, 1760]),
    ('gen6ou', [1500, 1630, 1760]),
]


def get_available_months():
    """Lista todos os meses disponíveis no Smogon Stats"""
    print("Buscando meses disponíveis...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        response.raise_for_status()

        # Parse HTML para encontrar diretórios YYYY-MM/
        pattern = r'href="(\d{4}-\d{2})/"'
        months = re.findall(pattern, response.text)
        months = sorted(set(months), reverse=True)

        print(f"Encontrados {len(months)} meses (mais recente: {months[0] if months else 'N/A'})")
        return months
    except Exception as e:
        print(f"Erro ao buscar meses: {e}")
        return []


def download_format_data(format_code, rating, month):
    """Baixa dados JSON de um formato específico"""
    url = f"{BASE_URL}/{month}/chaos/{format_code}-{rating}.json"

    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 404:
            return None
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if response.status_code != 404:
            print(f"  Erro HTTP: {e}")
        return None
    except Exception as e:
        print(f"  Erro: {e}")
        return None


def process_and_save(raw_data, format_code, rating, month):
    """Processa e salva os dados"""
    if not raw_data or 'data' not in raw_data:
        return False

    def calc_percentages(category_dict, top_n=None):
        if not category_dict:
            return []
        total = sum(category_dict.values())
        if total == 0:
            return []
        items = [(k, (v / total) * 100) for k, v in category_dict.items()]
        items.sort(key=lambda x: x[1], reverse=True)
        if top_n:
            items = items[:top_n]
        return [{'name': k, 'percentage': round(v, 2)} for k, v in items]

    def parse_spread(spread_str):
        try:
            nature, evs = spread_str.split(':')
            ev_values = evs.split('/')
            return {
                'nature': nature,
                'hp': int(ev_values[0]),
                'atk': int(ev_values[1]),
                'def': int(ev_values[2]),
                'spa': int(ev_values[3]),
                'spd': int(ev_values[4]),
                'spe': int(ev_values[5])
            }
        except:
            return None

    processed = {
        'info': raw_data.get('info', {}),
        'meta': {
            'format': format_code,
            'rating': rating,
            'month': month,
            'updated_at': datetime.now().isoformat()
        },
        'pokemon': {}
    }

    for pokemon_name, data in raw_data['data'].items():
        usage = data.get('usage', 0) * 100

        # Spreads
        spreads_raw = data.get('Spreads', {})
        spreads_processed = []
        total_spreads = sum(spreads_raw.values())
        for spread_str, count in sorted(spreads_raw.items(), key=lambda x: x[1], reverse=True)[:10]:
            parsed = parse_spread(spread_str)
            if parsed:
                parsed['percentage'] = round((count / total_spreads) * 100, 2) if total_spreads > 0 else 0
                parsed['raw'] = spread_str
                spreads_processed.append(parsed)

        # Teammates
        teammates_raw = data.get('Teammates', {})
        teammates = [
            {'name': k, 'score': round(v * 100, 2)}
            for k, v in sorted(teammates_raw.items(), key=lambda x: x[1], reverse=True)[:10]
            if v > 0
        ]

        processed['pokemon'][pokemon_name] = {
            'name': pokemon_name,
            'usage': round(usage, 2),
            'raw_count': data.get('Raw count', 0),
            'viability': data.get('Viability Ceiling', []),
            'abilities': calc_percentages(data.get('Abilities', {})),
            'items': calc_percentages(data.get('Items', {}), 10),
            'moves': calc_percentages(data.get('Moves', {}), 10),
            'spreads': spreads_processed,
            'teammates': teammates,
            'tera_types': calc_percentages(data.get('Tera Types', {})),
        }

    # Rankings
    sorted_pokemon = sorted(
        processed['pokemon'].items(),
        key=lambda x: x[1]['usage'],
        reverse=True
    )
    for rank, (name, _) in enumerate(sorted_pokemon, 1):
        processed['pokemon'][name]['rank'] = rank

    processed['ranked_list'] = [
        {'name': name, 'usage': data['usage'], 'rank': data['rank']}
        for name, data in sorted_pokemon
    ]

    # Salvar
    if not os.path.exists(STATS_DIR):
        os.makedirs(STATS_DIR)

    filename = f"{format_code}-{rating}-{month}.json"
    filepath = os.path.join(STATS_DIR, filename)

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(processed, f, ensure_ascii=False, indent=2)

    return True


def download_all_formats(month=None):
    """Baixa todos os formatos principais"""
    if not month:
        months = get_available_months()
        if not months:
            print("Nenhum mês disponível!")
            return
        month = months[0]

    print(f"\nBaixando dados de {month}...")
    print("=" * 50)

    success_count = 0
    fail_count = 0

    for format_code, ratings in MAIN_FORMATS:
        print(f"\n{format_code}:")

        for rating in ratings:
            print(f"  Rating {rating}...", end=" ", flush=True)

            raw_data = download_format_data(format_code, rating, month)

            if raw_data:
                if process_and_save(raw_data, format_code, rating, month):
                    pokemon_count = len(raw_data.get('data', {}))
                    print(f"OK ({pokemon_count} Pokémon)")
                    success_count += 1
                else:
                    print("ERRO (processamento)")
                    fail_count += 1
            else:
                print("N/A")
                fail_count += 1

            # Rate limiting
            time.sleep(0.5)

    print("\n" + "=" * 50)
    print(f"Concluído! {success_count} arquivos salvos, {fail_count} falhas")


def download_single_format(format_code, month=None):
    """Baixa um formato específico"""
    if not month:
        months = get_available_months()
        if not months:
            print("Nenhum mês disponível!")
            return
        month = months[0]

    # Determinar ratings
    if format_code in ['gen9ou', 'gen9doublesou']:
        ratings = [0, 1500, 1695, 1825]
    else:
        ratings = [0, 1500, 1630, 1760]

    print(f"\nBaixando {format_code} de {month}...")

    for rating in ratings:
        print(f"  Rating {rating}...", end=" ", flush=True)

        raw_data = download_format_data(format_code, rating, month)

        if raw_data:
            if process_and_save(raw_data, format_code, rating, month):
                pokemon_count = len(raw_data.get('data', {}))
                print(f"OK ({pokemon_count} Pokémon)")
            else:
                print("ERRO")
        else:
            print("N/A")

        time.sleep(0.5)

    print("\nConcluído!")


def list_cached_files():
    """Lista arquivos em cache"""
    if not os.path.exists(STATS_DIR):
        print("Nenhum dado em cache")
        return

    files = sorted(os.listdir(STATS_DIR))
    if not files:
        print("Nenhum dado em cache")
        return

    print(f"\nArquivos em cache ({len(files)}):")
    for f in files:
        filepath = os.path.join(STATS_DIR, f)
        size = os.path.getsize(filepath) / 1024
        print(f"  {f} ({size:.1f} KB)")


def main():
    args = sys.argv[1:]

    if not args:
        # Baixar todos os formatos
        download_all_formats()
    elif args[0] == '--list':
        list_cached_files()
    elif args[0] == '--months':
        months = get_available_months()
        print("Meses disponíveis:")
        for m in months[:12]:  # Mostrar últimos 12 meses
            print(f"  {m}")
    elif len(args) == 1:
        # Baixar formato específico
        download_single_format(args[0])
    elif len(args) == 2:
        # Baixar formato e mês específico
        download_single_format(args[0], args[1])
    else:
        print(__doc__)


if __name__ == '__main__':
    main()
