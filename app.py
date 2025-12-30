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

# Chave da API Anthropic (opcional - para sugestões de time)
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

FORMATS = {
    'vgc': {
        'nome': 'VGC (Doubles Oficial)',
        'formatos': {
            'gen9vgc2025regh': '[Gen 9] VGC 2025 Reg H',
            'gen9vgc2025reggbo3': '[Gen 9] VGC 2025 Reg G Bo3',
            'gen9vgc2026regg': '[Gen 9] VGC 2026 Reg G',
            'gen9vgc2026reggbo3': '[Gen 9] VGC 2026 Reg G Bo3',
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

# Mapeamento de nomes para sprites (casos especiais)
SPRITE_FIXES = {
    'Urshifu-Rapid-Strike': 'urshifu-rapid-strike',
    'Urshifu': 'urshifu',
    'Ogerpon-Hearthflame': 'ogerpon-hearthflame',
    'Ogerpon-Wellspring': 'ogerpon-wellspring',
    'Ogerpon-Cornerstone': 'ogerpon-cornerstone',
    'Terapagos-Stellar': 'terapagos-stellar',
    'Indeedee-F': 'indeedee-f',
    'Basculegion-F': 'basculegion-f',
    'Oinkologne-F': 'oinkologne-f',
    'Meowstic-F': 'meowstic-f',
    'Tornadus-Therian': 'tornadus-therian',
    'Thundurus-Therian': 'thundurus-therian',
    'Landorus-Therian': 'landorus-therian',
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
}

TERA_TYPES = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
    'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
    'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy', 'Stellar'
]

NATURES = [
    'Adamant', 'Bashful', 'Bold', 'Brave', 'Calm', 'Careful', 'Docile',
    'Gentle', 'Hardy', 'Hasty', 'Impish', 'Jolly', 'Lax', 'Lonely',
    'Mild', 'Modest', 'Naive', 'Naughty', 'Quiet', 'Quirky', 'Rash',
    'Relaxed', 'Sassy', 'Serious', 'Timid'
]


def get_sprite_name(pokemon_name):
    """Retorna o nome correto para o sprite"""
    if pokemon_name in SPRITE_FIXES:
        return SPRITE_FIXES[pokemon_name]
    # Limpar nome para URL
    return pokemon_name.lower().replace(' ', '').replace('-', '').replace('.', '').replace(':', '').replace("'", '')


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


def generate_showdown_set(pokemon_data, pokemon_name, custom=None):
    """Gera set no formato Showdown"""
    if custom:
        lines = [pokemon_name]
        if custom.get('item'):
            lines[0] += f" @ {custom['item']}"
        if custom.get('ability'):
            lines.append(f"Ability: {custom['ability']}")
        if custom.get('tera_type'):
            lines.append(f"Tera Type: {custom['tera_type']}")
        if custom.get('evs'):
            evs = custom['evs']
            evs_parts = []
            if evs.get('hp', 0) > 0: evs_parts.append(f"{evs['hp']} HP")
            if evs.get('atk', 0) > 0: evs_parts.append(f"{evs['atk']} Atk")
            if evs.get('def', 0) > 0: evs_parts.append(f"{evs['def']} Def")
            if evs.get('spa', 0) > 0: evs_parts.append(f"{evs['spa']} SpA")
            if evs.get('spd', 0) > 0: evs_parts.append(f"{evs['spd']} SpD")
            if evs.get('spe', 0) > 0: evs_parts.append(f"{evs['spe']} Spe")
            if evs_parts:
                lines.append(f"EVs: {' / '.join(evs_parts)}")
        if custom.get('ivs'):
            ivs = custom['ivs']
            ivs_parts = []
            if ivs.get('hp', 31) < 31: ivs_parts.append(f"{ivs['hp']} HP")
            if ivs.get('atk', 31) < 31: ivs_parts.append(f"{ivs['atk']} Atk")
            if ivs.get('def', 31) < 31: ivs_parts.append(f"{ivs['def']} Def")
            if ivs.get('spa', 31) < 31: ivs_parts.append(f"{ivs['spa']} SpA")
            if ivs.get('spd', 31) < 31: ivs_parts.append(f"{ivs['spd']} SpD")
            if ivs.get('spe', 31) < 31: ivs_parts.append(f"{ivs['spe']} Spe")
            if ivs_parts:
                lines.append(f"IVs: {' / '.join(ivs_parts)}")
        if custom.get('nature'):
            lines.append(f"{custom['nature']} Nature")
        if custom.get('moves'):
            for move in custom['moves'][:4]:
                if move:
                    lines.append(f"- {move}")
        return '\n'.join(lines)

    # Default: usa dados mais populares
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


# ==================== ROTAS ====================

@app.route('/')
def index():
    return render_template('index.html', formats=FORMATS)


@app.route('/format/<format_code>')
def format_page(format_code):
    all_formats = get_all_formats_flat()

    # Permitir qualquer formato (não só os listados)
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
        formats=FORMATS,
        tera_types=TERA_TYPES,
        natures=NATURES
    )


@app.route('/builder')
def builder_page():
    """Team Builder"""
    return render_template('builder.html', formats=FORMATS, tera_types=TERA_TYPES, natures=NATURES)


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


@app.route('/api/build', methods=['POST'])
def api_build():
    """Gera set customizado"""
    data = request.json
    pokemon_name = data.get('pokemon', '')
    custom = data.get('custom', {})

    showdown_set = generate_showdown_set(None, pokemon_name, custom)
    return jsonify({'set': showdown_set})


@app.route('/api/suggest-team', methods=['POST'])
def api_suggest_team():
    """Sugere complementos para o time usando LLM"""
    if not ANTHROPIC_API_KEY:
        return jsonify({'error': 'API key não configurada. Adicione ANTHROPIC_API_KEY nas variáveis de ambiente.'}), 400

    data = request.json
    current_team = data.get('team', [])
    format_code = data.get('format', 'gen9vgc2025regh')

    if len(current_team) >= 6:
        return jsonify({'error': 'Time já está completo'}), 400

    # Montar prompt
    team_str = ', '.join([p.get('name', '') for p in current_team if p.get('name')])
    slots_left = 6 - len(current_team)

    prompt = f"""Você é um especialista em Pokemon VGC competitivo.

O jogador está montando um time para o formato {format_code} e já tem: {team_str if team_str else 'nenhum Pokemon ainda'}.

Sugira {slots_left} Pokemon para completar o time, considerando:
- Sinergia com os Pokemon existentes
- Cobertura de tipos
- Roles necessários (suporte, atacante físico/especial, controle de velocidade, etc)
- Meta atual do formato

Responda em português brasileiro, em formato JSON com esta estrutura:
{{
    "sugestoes": [
        {{
            "pokemon": "Nome do Pokemon",
            "motivo": "Breve explicação de por que ele complementa o time",
            "role": "Papel no time (ex: Suporte, Sweeper, Tank, etc)"
        }}
    ],
    "dica_geral": "Uma dica sobre a estratégia geral do time"
}}"""

    try:
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            json={
                'model': 'claude-3-haiku-20240307',
                'max_tokens': 1024,
                'messages': [{'role': 'user', 'content': prompt}]
            },
            timeout=30
        )
        response.raise_for_status()

        result = response.json()
        content = result['content'][0]['text']

        # Tentar parsear JSON da resposta
        import json
        try:
            # Encontrar JSON na resposta
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                suggestions = json.loads(json_match.group())
                return jsonify(suggestions)
        except:
            pass

        return jsonify({'raw_response': content})

    except Exception as e:
        return jsonify({'error': f'Erro ao consultar LLM: {str(e)}'}), 500


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', formats=FORMATS), 404


@app.errorhandler(500)
def internal_error(e):
    return render_template('500.html', formats=FORMATS), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
