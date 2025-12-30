"""
PokeStatsBR - Estatísticas do Pokémon Showdown em Português
Aplicativo Desktop para Windows
"""

import os
import json
import requests
import re
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

BASE_STATS_URL = "https://www.smogon.com/stats"

# Chave da API Gemini (opcional - para análise de times)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# ==================== TODOS OS FORMATOS DO SHOWDOWN ====================

FORMATS = {
    'vgc': {
        'nome': 'VGC (Video Game Championships)',
        'formatos': {
            'gen9vgc2026regf': '[Gen 9] VGC 2026 Reg F',
            'gen9vgc2026regfbo3': '[Gen 9] VGC 2026 Reg F Bo3',
            'gen9vgc2025regh': '[Gen 9] VGC 2025 Reg H',
            'gen9vgc2025regj': '[Gen 9] VGC 2025 Reg J',
            'gen9vgc2025regg': '[Gen 9] VGC 2025 Reg G',
            'gen9vgc2025reggbo3': '[Gen 9] VGC 2025 Reg G Bo3',
            'gen9vgc2024regg': '[Gen 9] VGC 2024 Reg G',
            'gen9vgc2024regf': '[Gen 9] VGC 2024 Reg F',
            'gen9vgc2024rege': '[Gen 9] VGC 2024 Reg E',
            'gen9vgc2024regd': '[Gen 9] VGC 2024 Reg D',
            'gen9vgc2023series2': '[Gen 9] VGC 2023 Series 2',
            'gen9vgc2023series1': '[Gen 9] VGC 2023 Series 1',
        }
    },
    'bss': {
        'nome': 'Battle Stadium',
        'formatos': {
            'gen9battlestadiumsingles': '[Gen 9] Battle Stadium Singles',
            'gen9battlestadiumsinglesregulationh': '[Gen 9] BSS Reg H',
            'gen9battlestadiumsinglesregulationg': '[Gen 9] BSS Reg G',
            'gen9battlestadiumsinglesregulationf': '[Gen 9] BSS Reg F',
            'gen9battlestadiumdoubles': '[Gen 9] Battle Stadium Doubles',
        }
    },
    'singles': {
        'nome': 'Singles Smogon (Gen 9)',
        'formatos': {
            'gen9ou': '[Gen 9] OverUsed',
            'gen9ubers': '[Gen 9] Ubers',
            'gen9uu': '[Gen 9] UnderUsed',
            'gen9ru': '[Gen 9] RarelyUsed',
            'gen9nu': '[Gen 9] NeverUsed',
            'gen9pu': '[Gen 9] PU',
            'gen9zu': '[Gen 9] ZeroUsed',
            'gen9lc': '[Gen 9] Little Cup',
        }
    },
    'doubles': {
        'nome': 'Doubles Smogon (Gen 9)',
        'formatos': {
            'gen9doublesou': '[Gen 9] Doubles OU',
            'gen9doublesubers': '[Gen 9] Doubles Ubers',
            'gen9doublesuu': '[Gen 9] Doubles UU',
        }
    },
    'nationaldex': {
        'nome': 'National Dex (Gen 9)',
        'formatos': {
            'gen9nationaldex': '[Gen 9] National Dex',
            'gen9nationaldexubers': '[Gen 9] National Dex Ubers',
            'gen9nationaldexuu': '[Gen 9] National Dex UU',
            'gen9nationaldexru': '[Gen 9] National Dex RU',
            'gen9nationaldexdoubles': '[Gen 9] National Dex Doubles',
            'gen9nationaldexmonotype': '[Gen 9] National Dex Monotype',
            'gen9nationaldexag': '[Gen 9] National Dex AG',
        }
    },
    'oms': {
        'nome': 'Other Metagames (Gen 9)',
        'formatos': {
            'gen9anythinggoes': '[Gen 9] Anything Goes',
            'gen9monotype': '[Gen 9] Monotype',
            'gen9balancedhackmons': '[Gen 9] Balanced Hackmons',
            'gen9almostanyability': '[Gen 9] Almost Any Ability',
            'gen9mixandmega': '[Gen 9] Mix and Mega',
            'gen9stabmons': '[Gen 9] STABmons',
            'gen9godlygift': '[Gen 9] Godly Gift',
            'gen9cap': '[Gen 9] CAP',
            'gen91v1': '[Gen 9] 1v1',
            'gen92v2doubles': '[Gen 9] 2v2 Doubles',
            'gen9metronomebattle': '[Gen 9] Metronome Battle',
            'gen9sharedpower': '[Gen 9] Shared Power',
            'gen9fortemons': '[Gen 9] Fortemons',
            'gen9purehackmons': '[Gen 9] Pure Hackmons',
        }
    },
    'randoms': {
        'nome': 'Random Battles',
        'formatos': {
            'gen9randombattle': '[Gen 9] Random Battle',
            'gen9randomdoublesbattle': '[Gen 9] Random Doubles',
            'gen8randombattle': '[Gen 8] Random Battle',
            'gen7randombattle': '[Gen 7] Random Battle',
            'gen6randombattle': '[Gen 6] Random Battle',
            'gen5randombattle': '[Gen 5] Random Battle',
        }
    },
    'gen8': {
        'nome': 'Geração 8 (Sword/Shield)',
        'formatos': {
            'gen8ou': '[Gen 8] OverUsed',
            'gen8ubers': '[Gen 8] Ubers',
            'gen8uu': '[Gen 8] UnderUsed',
            'gen8ru': '[Gen 8] RarelyUsed',
            'gen8nu': '[Gen 8] NeverUsed',
            'gen8pu': '[Gen 8] PU',
            'gen8lc': '[Gen 8] Little Cup',
            'gen8doublesou': '[Gen 8] Doubles OU',
            'gen8vgc2022': '[Gen 8] VGC 2022',
            'gen8vgc2021': '[Gen 8] VGC 2021',
            'gen8vgc2020': '[Gen 8] VGC 2020',
            'gen8nationaldex': '[Gen 8] National Dex',
            'gen8anythinggoes': '[Gen 8] Anything Goes',
            'gen8monotype': '[Gen 8] Monotype',
            'gen8balancedhackmons': '[Gen 8] Balanced Hackmons',
            'gen8purehackmons': '[Gen 8] Pure Hackmons',
        }
    },
    'gen7': {
        'nome': 'Geração 7 (Sun/Moon)',
        'formatos': {
            'gen7ou': '[Gen 7] OverUsed',
            'gen7ubers': '[Gen 7] Ubers',
            'gen7uu': '[Gen 7] UnderUsed',
            'gen7ru': '[Gen 7] RarelyUsed',
            'gen7nu': '[Gen 7] NeverUsed',
            'gen7pu': '[Gen 7] PU',
            'gen7lc': '[Gen 7] Little Cup',
            'gen7doublesou': '[Gen 7] Doubles OU',
            'gen7vgc2019': '[Gen 7] VGC 2019',
            'gen7vgc2018': '[Gen 7] VGC 2018',
            'gen7vgc2017': '[Gen 7] VGC 2017',
            'gen7anythinggoes': '[Gen 7] Anything Goes',
            'gen7monotype': '[Gen 7] Monotype',
            'gen7balancedhackmons': '[Gen 7] Balanced Hackmons',
            'gen7purehackmons': '[Gen 7] Pure Hackmons',
        }
    },
    'gen6': {
        'nome': 'Geração 6 (X/Y)',
        'formatos': {
            'gen6ou': '[Gen 6] OverUsed',
            'gen6ubers': '[Gen 6] Ubers',
            'gen6uu': '[Gen 6] UnderUsed',
            'gen6ru': '[Gen 6] RarelyUsed',
            'gen6nu': '[Gen 6] NeverUsed',
            'gen6pu': '[Gen 6] PU',
            'gen6lc': '[Gen 6] Little Cup',
            'gen6doublesou': '[Gen 6] Doubles OU',
            'gen6vgc2016': '[Gen 6] VGC 2016',
            'gen6anythinggoes': '[Gen 6] Anything Goes',
            'gen6monotype': '[Gen 6] Monotype',
            'gen6balancedhackmons': '[Gen 6] Balanced Hackmons',
            'gen6purehackmons': '[Gen 6] Pure Hackmons',
        }
    },
    'gen5': {
        'nome': 'Geração 5 (Black/White)',
        'formatos': {
            'gen5ou': '[Gen 5] OverUsed',
            'gen5ubers': '[Gen 5] Ubers',
            'gen5uu': '[Gen 5] UnderUsed',
            'gen5ru': '[Gen 5] RarelyUsed',
            'gen5nu': '[Gen 5] NeverUsed',
            'gen5lc': '[Gen 5] Little Cup',
            'gen5doublesou': '[Gen 5] Doubles OU',
        }
    },
    'gen4': {
        'nome': 'Geração 4 (Diamond/Pearl)',
        'formatos': {
            'gen4ou': '[Gen 4] OverUsed',
            'gen4ubers': '[Gen 4] Ubers',
            'gen4uu': '[Gen 4] UnderUsed',
            'gen4nu': '[Gen 4] NeverUsed',
            'gen4lc': '[Gen 4] Little Cup',
            'gen4doublesou': '[Gen 4] Doubles OU',
        }
    },
    'gen3': {
        'nome': 'Geração 3 (Ruby/Sapphire)',
        'formatos': {
            'gen3ou': '[Gen 3] OverUsed',
            'gen3ubers': '[Gen 3] Ubers',
            'gen3uu': '[Gen 3] UnderUsed',
            'gen3nu': '[Gen 3] NeverUsed',
            'gen3lc': '[Gen 3] Little Cup',
        }
    },
    'gen2': {
        'nome': 'Geração 2 (Gold/Silver)',
        'formatos': {
            'gen2ou': '[Gen 2] OverUsed',
            'gen2ubers': '[Gen 2] Ubers',
            'gen2uu': '[Gen 2] UnderUsed',
            'gen2nu': '[Gen 2] NeverUsed',
        }
    },
    'gen1': {
        'nome': 'Geração 1 (Red/Blue)',
        'formatos': {
            'gen1ou': '[Gen 1] OverUsed',
            'gen1ubers': '[Gen 1] Ubers',
            'gen1uu': '[Gen 1] UnderUsed',
            'gen1nu': '[Gen 1] NeverUsed',
        }
    },
}

# Ratings especiais por formato
DEFAULT_RATINGS = {
    'gen9ou': [0, 1500, 1695, 1825],
    'gen9doublesou': [0, 1500, 1695, 1825],
    'gen8ou': [0, 1500, 1695, 1825],
    'gen8doublesou': [0, 1500, 1695, 1825],
    'gen7ou': [0, 1500, 1695, 1825],
    'gen6ou': [0, 1500, 1695, 1825],
    'gen5ou': [0, 1500, 1695, 1825],
    'gen4ou': [0, 1500, 1695, 1825],
    'gen3ou': [0, 1500, 1695, 1825],
    'gen2ou': [0, 1500, 1695, 1825],
    'gen1ou': [0, 1500, 1695, 1825],
    'default': [0, 1500, 1630, 1760]
}

# Mapeamento de nomes para sprites (casos especiais)
SPRITE_FIXES = {
    'Urshifu-Rapid-Strike': 'urshifu-rapid-strike',
    'Urshifu': 'urshifu',
    'Urshifu-Single-Strike': 'urshifu',
    'Ogerpon': 'ogerpon',
    'Ogerpon-Hearthflame': 'ogerpon-hearthflame',
    'Ogerpon-Wellspring': 'ogerpon-wellspring',
    'Ogerpon-Cornerstone': 'ogerpon-cornerstone',
    'Terapagos': 'terapagos',
    'Terapagos-Stellar': 'terapagos-stellar',
    'Terapagos-Terastal': 'terapagos-terastal',
    'Indeedee-F': 'indeedee-f',
    'Basculegion': 'basculegion',
    'Basculegion-F': 'basculegion-f',
    'Oinkologne-F': 'oinkologne-f',
    'Meowstic-F': 'meowstic-f',
    'Tornadus': 'tornadus',
    'Tornadus-Therian': 'tornadus-therian',
    'Thundurus': 'thundurus',
    'Thundurus-Therian': 'thundurus-therian',
    'Landorus': 'landorus',
    'Landorus-Therian': 'landorus-therian',
    'Enamorus': 'enamorus',
    'Enamorus-Therian': 'enamorus-therian',
    'Raging Bolt': 'ragingbolt',
    'Iron Crown': 'ironcrown',
    'Iron Boulder': 'ironboulder',
    'Gouging Fire': 'gougingfire',
    'Walking Wake': 'walkingwake',
    'Iron Leaves': 'ironleaves',
    'Iron Hands': 'ironhands',
    'Iron Bundle': 'ironbundle',
    'Iron Jugulis': 'ironjugulis',
    'Iron Moth': 'ironmoth',
    'Iron Thorns': 'ironthorns',
    'Iron Valiant': 'ironvaliant',
    'Iron Treads': 'irontreads',
    'Roaring Moon': 'roaringmoon',
    'Flutter Mane': 'fluttermane',
    'Sandy Shocks': 'sandyshocks',
    'Scream Tail': 'screamtail',
    'Brute Bonnet': 'brutebonnet',
    'Slither Wing': 'slitherwing',
    'Great Tusk': 'greattusk',
    'Chi-Yu': 'chiyu',
    'Chien-Pao': 'chienpao',
    'Ting-Lu': 'tinglu',
    'Wo-Chien': 'wochien',
    'Koraidon': 'koraidon',
    'Miraidon': 'miraidon',
    'Calyrex': 'calyrex',
    'Calyrex-Ice': 'calyrex-ice',
    'Calyrex-Shadow': 'calyrex-shadow',
    'Zacian': 'zacian',
    'Zacian-Crowned': 'zacian-crowned',
    'Zamazenta': 'zamazenta',
    'Zamazenta-Crowned': 'zamazenta-crowned',
    'Kyurem': 'kyurem',
    'Kyurem-Black': 'kyurem-black',
    'Kyurem-White': 'kyurem-white',
    'Necrozma': 'necrozma',
    'Necrozma-Dusk-Mane': 'necrozma-dusk-mane',
    'Necrozma-Dawn-Wings': 'necrozma-dawn-wings',
    'Necrozma-Ultra': 'necrozma-ultra',
    'Giratina': 'giratina',
    'Giratina-Origin': 'giratina-origin',
    'Deoxys': 'deoxys',
    'Deoxys-Attack': 'deoxys-attack',
    'Deoxys-Defense': 'deoxys-defense',
    'Deoxys-Speed': 'deoxys-speed',
    'Shaymin': 'shaymin',
    'Shaymin-Sky': 'shaymin-sky',
    'Hoopa': 'hoopa',
    'Hoopa-Unbound': 'hoopa-unbound',
    'Meloetta': 'meloetta',
    'Meloetta-Pirouette': 'meloetta-pirouette',
    'Keldeo': 'keldeo',
    'Keldeo-Resolute': 'keldeo-resolute',
    'Rotom': 'rotom',
    'Rotom-Wash': 'rotom-wash',
    'Rotom-Heat': 'rotom-heat',
    'Rotom-Mow': 'rotom-mow',
    'Rotom-Fan': 'rotom-fan',
    'Rotom-Frost': 'rotom-frost',
    'Wormadam': 'wormadam',
    'Wormadam-Sandy': 'wormadam-sandy',
    'Wormadam-Trash': 'wormadam-trash',
}


def get_sprite_name(pokemon_name):
    """Retorna o nome correto para o sprite"""
    if pokemon_name in SPRITE_FIXES:
        return SPRITE_FIXES[pokemon_name]
    return pokemon_name.lower().replace(' ', '').replace('-', '').replace('.', '').replace(':', '').replace("'", '')


def get_all_formats_flat():
    """Retorna todos os formatos em um dicionário plano"""
    all_formats = {}
    for category in FORMATS.values():
        all_formats.update(category['formatos'])
    return all_formats


def get_ratings_for_format(format_code):
    """Retorna ratings disponíveis para um formato"""
    if format_code in DEFAULT_RATINGS:
        return DEFAULT_RATINGS[format_code]
    return DEFAULT_RATINGS['default']


def get_available_months():
    """Lista os meses disponíveis no Smogon Stats"""
    try:
        response = requests.get(f"{BASE_STATS_URL}/", timeout=10)
        response.raise_for_status()
        pattern = r'href="(\d{4}-\d{2})/"'
        months = re.findall(pattern, response.text)
        months = sorted(set(months), reverse=True)
        return months
    except Exception as e:
        print(f"Erro ao buscar meses: {e}")
        return []


def get_available_formats_for_month(month):
    """Lista os formatos disponíveis em um mês específico"""
    try:
        response = requests.get(f"{BASE_STATS_URL}/{month}/chaos/", timeout=10)
        response.raise_for_status()
        pattern = r'href="([a-z0-9]+)-\d+\.json"'
        formats = re.findall(pattern, response.text)
        return list(set(formats))
    except Exception as e:
        print(f"Erro ao buscar formatos: {e}")
        return []


def fetch_smogon_data(format_code, rating, month):
    """Busca dados do Smogon Stats"""
    url = f"{BASE_STATS_URL}/{month}/chaos/{format_code}-{rating}.json"
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Erro ao buscar {url}: {e}")
        return None


def process_pokemon_data(raw_json):
    """Processa JSON bruto do Smogon"""
    if not raw_json or 'data' not in raw_json:
        return None

    processed = {
        'info': raw_json.get('info', {}),
        'pokemon': {}
    }

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

    for pokemon_name, data in raw_json['data'].items():
        usage = data.get('usage', 0) * 100

        spreads_raw = data.get('Spreads', {})
        spreads_processed = []
        total_spreads = sum(spreads_raw.values()) if spreads_raw else 0
        for spread_str, count in sorted(spreads_raw.items(), key=lambda x: x[1], reverse=True)[:10]:
            parsed = parse_spread(spread_str)
            if parsed:
                parsed['percentage'] = round((count / total_spreads) * 100, 2) if total_spreads > 0 else 0
                parsed['raw'] = spread_str
                spreads_processed.append(parsed)

        teammates_raw = data.get('Teammates', {})
        teammates = [
            {'name': k, 'score': round(v * 100, 2)}
            for k, v in sorted(teammates_raw.items(), key=lambda x: x[1], reverse=True)[:10]
            if v > 0
        ]

        # Checks and Counters
        checks_raw = data.get('Checks and Counters', {})
        checks = []
        for check_name, check_data in sorted(checks_raw.items(), key=lambda x: x[1][1] if len(x[1]) > 1 else 0, reverse=True)[:10]:
            if isinstance(check_data, list) and len(check_data) >= 2:
                checks.append({
                    'name': check_name,
                    'score': round(check_data[1], 2) if check_data[1] else 0
                })

        processed['pokemon'][pokemon_name] = {
            'name': pokemon_name,
            'sprite_name': get_sprite_name(pokemon_name),
            'usage': round(usage, 2),
            'raw_count': data.get('Raw count', 0),
            'viability': data.get('Viability Ceiling', []),
            'abilities': calc_percentages(data.get('Abilities', {})),
            'items': calc_percentages(data.get('Items', {}), 15),
            'moves': calc_percentages(data.get('Moves', {}), 15),
            'spreads': spreads_processed,
            'teammates': teammates,
            'tera_types': calc_percentages(data.get('Tera Types', {})),
            'checks': checks,
            'happiness': data.get('Happiness', {}),
        }

    sorted_pokemon = sorted(
        processed['pokemon'].items(),
        key=lambda x: x[1]['usage'],
        reverse=True
    )
    for rank, (name, _) in enumerate(sorted_pokemon, 1):
        processed['pokemon'][name]['rank'] = rank

    processed['ranked_list'] = [
        {'name': name, 'usage': data['usage'], 'rank': data['rank'], 'sprite_name': data['sprite_name']}
        for name, data in sorted_pokemon
    ]

    return processed


def generate_showdown_set(pokemon_data, pokemon_name):
    """Gera set no formato Showdown"""
    lines = [pokemon_name]

    if pokemon_data.get('items'):
        lines[0] += f" @ {pokemon_data['items'][0]['name']}"

    if pokemon_data.get('abilities'):
        lines.append(f"Ability: {pokemon_data['abilities'][0]['name']}")

    if pokemon_data.get('tera_types'):
        lines.append(f"Tera Type: {pokemon_data['tera_types'][0]['name']}")

    if pokemon_data.get('spreads'):
        spread = pokemon_data['spreads'][0]
        evs_parts = []
        if spread['hp'] > 0: evs_parts.append(f"{spread['hp']} HP")
        if spread['atk'] > 0: evs_parts.append(f"{spread['atk']} Atk")
        if spread['def'] > 0: evs_parts.append(f"{spread['def']} Def")
        if spread['spa'] > 0: evs_parts.append(f"{spread['spa']} SpA")
        if spread['spd'] > 0: evs_parts.append(f"{spread['spd']} SpD")
        if spread['spe'] > 0: evs_parts.append(f"{spread['spe']} Spe")
        if evs_parts:
            lines.append(f"EVs: {' / '.join(evs_parts)}")
        lines.append(f"{spread['nature']} Nature")

    if pokemon_data.get('moves'):
        for move in pokemon_data['moves'][:4]:
            lines.append(f"- {move['name']}")

    return '\n'.join(lines)


# ==================== REPLAYS ====================

REPLAY_BASE_URL = "https://replay.pokemonshowdown.com"


def fetch_replays(format_code, page=1):
    """Busca replays do Pokemon Showdown"""
    url = f"{REPLAY_BASE_URL}/search.json?format={format_code}&page={page}"
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Erro ao buscar replays: {e}")
        return []


def fetch_replay_detail(replay_id):
    """Busca detalhes de um replay específico"""
    url = f"{REPLAY_BASE_URL}/{replay_id}.json"
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Erro ao buscar replay {replay_id}: {e}")
        return None


def parse_team_from_log(log, player_num):
    """Extrai o time de um jogador do log do replay"""
    team = []
    player_prefix = f"p{player_num}"

    poke_pattern = rf'\|poke\|{player_prefix}\|([^|]+)\|'
    poke_matches = re.findall(poke_pattern, log)

    for match in poke_matches:
        parts = match.split(',')
        pokemon_name = parts[0].strip()
        level = 50
        gender = None

        for part in parts[1:]:
            part = part.strip()
            if part.startswith('L'):
                try:
                    level = int(part[1:])
                except:
                    pass
            elif part in ['M', 'F']:
                gender = part

        team.append({
            'name': pokemon_name,
            'sprite_name': get_sprite_name(pokemon_name),
            'level': level,
            'gender': gender,
            'item': None,
            'ability': None,
            'tera_type': None,
            'moves': []
        })

    # Extrair abilities
    ability_pattern = rf'\|-ability\|{player_prefix}[ab]: ([^|]+)\|([^|]+)'
    ability_matches = re.findall(ability_pattern, log)
    for nickname, ability in ability_matches:
        for poke in team:
            if nickname.lower() in poke['name'].lower() or poke['name'].lower() in nickname.lower():
                poke['ability'] = ability
                break

    # Extrair Tera types
    tera_pattern = rf'\|-terastallize\|{player_prefix}[ab]: ([^|]+)\|([^|]+)'
    tera_matches = re.findall(tera_pattern, log)
    for nickname, tera_type in tera_matches:
        for poke in team:
            if nickname.lower() in poke['name'].lower() or poke['name'].lower() in nickname.lower():
                poke['tera_type'] = tera_type
                break

    # Extrair moves usados
    move_pattern = rf'\|move\|{player_prefix}[ab]: ([^|]+)\|([^|]+)'
    move_matches = re.findall(move_pattern, log)
    for nickname, move in move_matches:
        for poke in team:
            if (nickname.lower() in poke['name'].lower() or poke['name'].lower() in nickname.lower()):
                if move not in poke['moves'] and len(poke['moves']) < 4:
                    poke['moves'].append(move)
                break

    return team


def generate_team_export(team):
    """Gera exportação do time no formato Showdown"""
    lines = []
    for poke in team:
        pokemon_line = poke['name']
        if poke.get('item'):
            pokemon_line += f" @ {poke['item']}"
        lines.append(pokemon_line)

        if poke.get('ability'):
            lines.append(f"Ability: {poke['ability']}")

        if poke.get('tera_type'):
            lines.append(f"Tera Type: {poke['tera_type']}")

        if poke.get('level') and poke['level'] != 100:
            lines.append(f"Level: {poke['level']}")

        for move in poke.get('moves', []):
            lines.append(f"- {move}")

        lines.append("")

    return '\n'.join(lines)


# ==================== ROTAS ====================

@app.route('/')
def index():
    return render_template('index.html', formats=FORMATS)


@app.route('/format/<format_code>')
def format_page(format_code):
    all_formats = get_all_formats_flat()
    format_name = all_formats.get(format_code, format_code)
    ratings = get_ratings_for_format(format_code)
    months = get_available_months()

    return render_template(
        'format.html',
        format_code=format_code,
        format_name=format_name,
        ratings=ratings,
        months=months[:12],
        formats=FORMATS
    )


@app.route('/pokemon/<format_code>/<pokemon_name>')
def pokemon_page(format_code, pokemon_name):
    all_formats = get_all_formats_flat()
    format_name = all_formats.get(format_code, format_code)

    return render_template(
        'pokemon.html',
        format_code=format_code,
        format_name=format_name,
        pokemon_name=pokemon_name,
        formats=FORMATS
    )


@app.route('/replays')
@app.route('/replays/<format_code>')
def replays_page(format_code=None):
    """Página de Replays"""
    if not format_code:
        format_code = 'gen9vgc2026regf'
    all_formats = get_all_formats_flat()
    format_name = all_formats.get(format_code, format_code)
    return render_template('replays.html', formats=FORMATS, format_code=format_code, format_name=format_name)


@app.route('/about')
def about():
    return render_template('about.html', formats=FORMATS)


# ==================== API ====================

@app.route('/api/months')
def api_months():
    months = get_available_months()
    return jsonify({'months': months})


@app.route('/api/formats/<month>')
def api_formats_for_month(month):
    """Lista formatos disponíveis em um mês"""
    formats = get_available_formats_for_month(month)
    return jsonify({'formats': formats})


@app.route('/api/stats/<format_code>')
def api_stats(format_code):
    rating = request.args.get('rating', '1760')
    month = request.args.get('month')

    if not month:
        months = get_available_months()
        month = months[0] if months else None

    if not month:
        return jsonify({'error': 'Nenhum mês disponível'}), 404

    raw_data = fetch_smogon_data(format_code, rating, month)
    if not raw_data:
        return jsonify({'error': f'Dados não encontrados para {format_code} rating {rating} em {month}'}), 404

    data = process_pokemon_data(raw_data)
    if not data:
        return jsonify({'error': 'Erro ao processar dados'}), 500

    data['meta'] = {'format': format_code, 'rating': rating, 'month': month}
    return jsonify(data)


@app.route('/api/pokemon/<format_code>/<pokemon_name>')
def api_pokemon(format_code, pokemon_name):
    rating = request.args.get('rating', '1760')
    month = request.args.get('month')

    if not month:
        months = get_available_months()
        month = months[0] if months else None

    if not month:
        return jsonify({'error': 'Nenhum mês disponível'}), 404

    raw_data = fetch_smogon_data(format_code, rating, month)
    if not raw_data:
        return jsonify({'error': 'Dados não encontrados'}), 404

    data = process_pokemon_data(raw_data)
    if not data or 'pokemon' not in data:
        return jsonify({'error': 'Erro ao processar dados'}), 500

    pokemon_data = None
    for name, poke_data in data['pokemon'].items():
        if name.lower() == pokemon_name.lower():
            pokemon_data = poke_data
            break

    if not pokemon_data:
        return jsonify({'error': 'Pokémon não encontrado'}), 404

    pokemon_data['showdown_set'] = generate_showdown_set(pokemon_data, pokemon_data['name'])
    pokemon_data['meta'] = {'format': format_code, 'rating': rating, 'month': month}

    return jsonify(pokemon_data)


# ==================== API REPLAYS ====================

@app.route('/api/replays/<format_code>')
def api_replays(format_code):
    """Busca replays de um formato"""
    page = request.args.get('page', 1, type=int)
    replays = fetch_replays(format_code, page)

    if isinstance(replays, list):
        replays = replays[:20]

    return jsonify({'replays': replays, 'format': format_code, 'page': page})


@app.route('/api/replay/<replay_id>')
def api_replay_detail(replay_id):
    """Busca detalhes de um replay com times parseados"""
    replay = fetch_replay_detail(replay_id)

    if not replay:
        return jsonify({'error': 'Replay não encontrado'}), 404

    log = replay.get('log', '')
    team1 = parse_team_from_log(log, 1)
    team2 = parse_team_from_log(log, 2)
    export1 = generate_team_export(team1)
    export2 = generate_team_export(team2)

    return jsonify({
        'id': replay.get('id'),
        'format': replay.get('format'),
        'players': replay.get('players', []),
        'rating': replay.get('rating'),
        'uploadtime': replay.get('uploadtime'),
        'views': replay.get('views'),
        'p1': replay.get('p1'),
        'p2': replay.get('p2'),
        'winner': replay.get('winner'),
        'team1': team1,
        'team2': team2,
        'export1': export1,
        'export2': export2,
        'replay_url': f"https://replay.pokemonshowdown.com/{replay_id}"
    })


@app.route('/api/analyze-team', methods=['POST'])
def api_analyze_team():
    """Analisa um time e dá dicas de como jogar"""
    if not GEMINI_API_KEY:
        return jsonify({'error': 'API key não configurada. Adicione GEMINI_API_KEY nas variáveis de ambiente.'}), 400

    data = request.json
    team = data.get('team', [])
    format_code = data.get('format', 'gen9vgc2026regf')

    if not team:
        return jsonify({'error': 'Time vazio'}), 400

    team_desc = []
    for poke in team:
        desc = poke.get('name', 'Unknown')
        if poke.get('tera_type'):
            desc += f" (Tera {poke['tera_type']})"
        if poke.get('moves'):
            desc += f" - Moves: {', '.join(poke['moves'][:4])}"
        team_desc.append(desc)

    team_str = '\n'.join(team_desc)
    is_vgc = 'vgc' in format_code.lower() or 'doubles' in format_code.lower()
    format_type = "VGC (doubles)" if is_vgc else "Singles"

    prompt = f"""Você é um coach profissional de Pokemon competitivo.

Analise este time de {format_type} ({format_code}) e explique como jogar com ele:

{team_str}

Forneça uma análise detalhada em português brasileiro incluindo:

1. **Visão Geral do Time**: Qual é o arquétipo/estilo do time
2. **Win Conditions**: Quais são as condições de vitória principais
3. **Leads Recomendados**: Quais Pokemon devem começar na frente
4. **Synergias Importantes**: Quais combinações funcionam bem
5. **Ameaças e Counters**: Pokemon/estratégias perigosas e como lidar
6. **Dicas de Gameplay**: Quando usar Tera, prioridade de knockouts
7. **Matchups Difíceis**: Times que dão problema e como jogar contra

Seja específico e prático."""

    try:
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{'parts': [{'text': prompt}]}],
                'generationConfig': {'temperature': 0.7, 'maxOutputTokens': 2048}
            },
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        content = result['candidates'][0]['content']['parts'][0]['text']
        return jsonify({'analysis': content, 'format': format_code})
    except Exception as e:
        return jsonify({'error': f'Erro ao analisar time: {str(e)}'}), 500


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', formats=FORMATS), 404


@app.errorhandler(500)
def internal_error(e):
    return render_template('500.html', formats=FORMATS), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
