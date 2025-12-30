"""
PokeStatsBR - Estatísticas do Pokémon Showdown em Português
"""

import os
import json
import requests
import re
from flask import Flask, render_template, jsonify, request, abort

app = Flask(__name__)

BASE_STATS_URL = "https://www.smogon.com/stats"

FORMATS = {
    'vgc': {
        'nome': 'VGC (Doubles Oficial)',
        'formatos': {
            'gen9vgc2025regh': '[Gen 9] VGC 2025 Reg H',
            'gen9vgc2025regg': '[Gen 9] VGC 2025 Reg G',
        }
    },
    'singles': {
        'nome': 'Singles Smogon',
        'formatos': {
            'gen9ou': '[Gen 9] OverUsed',
            'gen9ubers': '[Gen 9] Ubers',
            'gen9uu': '[Gen 9] UnderUsed',
            'gen9ru': '[Gen 9] RarelyUsed',
            'gen9nu': '[Gen 9] NeverUsed',
            'gen9pu': '[Gen 9] PU',
            'gen9lc': '[Gen 9] Little Cup',
            'gen9monotype': '[Gen 9] Monotype',
        }
    },
    'doubles': {
        'nome': 'Doubles Smogon',
        'formatos': {
            'gen9doublesou': '[Gen 9] Doubles OU',
            'gen9doublesubers': '[Gen 9] Doubles Ubers',
            'gen9doublesuu': '[Gen 9] Doubles UU',
        }
    },
    'nationaldex': {
        'nome': 'National Dex',
        'formatos': {
            'gen9nationaldex': '[Gen 9] National Dex',
            'gen9nationaldexubers': '[Gen 9] National Dex Ubers',
            'gen9nationaldexmonotype': '[Gen 9] National Dex Monotype',
        }
    },
    'outros': {
        'nome': 'Outros Formatos',
        'formatos': {
            'gen9anythinggoes': '[Gen 9] Anything Goes',
            'gen9randombattle': '[Gen 9] Random Battle',
            'gen9balancedhackmons': '[Gen 9] Balanced Hackmons',
            'gen91v1': '[Gen 9] 1v1',
        }
    },
    'legacy': {
        'nome': 'Gerações Anteriores',
        'formatos': {
            'gen8ou': '[Gen 8] OverUsed',
            'gen7ou': '[Gen 7] OverUsed',
            'gen6ou': '[Gen 6] OverUsed',
            'gen5ou': '[Gen 5] OverUsed',
        }
    }
}

DEFAULT_RATINGS = {
    'gen9ou': [0, 1500, 1695, 1825],
    'gen9doublesou': [0, 1500, 1695, 1825],
    'default': [0, 1500, 1630, 1760]
}


def get_all_formats_flat():
    all_formats = {}
    for category in FORMATS.values():
        all_formats.update(category['formatos'])
    return all_formats


def get_ratings_for_format(format_code):
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

    return processed


def generate_showdown_set(pokemon_data, pokemon_name):
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
        if spread['hp'] > 0:
            evs_parts.append(f"{spread['hp']} HP")
        if spread['atk'] > 0:
            evs_parts.append(f"{spread['atk']} Atk")
        if spread['def'] > 0:
            evs_parts.append(f"{spread['def']} Def")
        if spread['spa'] > 0:
            evs_parts.append(f"{spread['spa']} SpA")
        if spread['spd'] > 0:
            evs_parts.append(f"{spread['spd']} SpD")
        if spread['spe'] > 0:
            evs_parts.append(f"{spread['spe']} Spe")
        if evs_parts:
            lines.append(f"EVs: {' / '.join(evs_parts)}")
        lines.append(f"{spread['nature']} Nature")

    if pokemon_data.get('moves'):
        for move in pokemon_data['moves'][:4]:
            lines.append(f"- {move['name']}")

    return '\n'.join(lines)


# ==================== ROTAS ====================

@app.route('/')
def index():
    return render_template('index.html', formats=FORMATS)


@app.route('/format/<format_code>')
def format_page(format_code):
    all_formats = get_all_formats_flat()
    if format_code not in all_formats:
        abort(404)

    format_name = all_formats[format_code]
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
    if format_code not in all_formats:
        abort(404)

    format_name = all_formats[format_code]

    return render_template(
        'pokemon.html',
        format_code=format_code,
        format_name=format_name,
        pokemon_name=pokemon_name,
        formats=FORMATS
    )


@app.route('/about')
def about():
    return render_template('about.html', formats=FORMATS)


# ==================== API ====================

@app.route('/api/months')
def api_months():
    months = get_available_months()
    return jsonify({'months': months})


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
        return jsonify({'error': 'Dados não encontrados'}), 404

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


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', formats=FORMATS), 404


@app.errorhandler(500)
def internal_error(e):
    return render_template('500.html', formats=FORMATS), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
