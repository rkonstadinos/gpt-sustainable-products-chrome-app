from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

openai.api_key = 'your-openai-api-key'

@app.route('/', methods=['POST', 'GET'])
def all_my_projects():
    return 'Project Links'

@app.route('/sustain', methods=['POST', 'GET'])
def extract_sustainable_attributes():
    product_title = ''
    product_description = ''
    if request.method == 'GET':
        # Handle GET request & Access the query parameters
        product_title = request.args.get('productTitle', '')
        product_description = request.args.get('productDescription', '')
    elif request.method == 'POST':
        # Handle POST request & Access the query parameters
        data = request.get_json()
        product_title = data.get('productTitle', '')
        product_description = data.get('productDescription', '')

    if not product_title or not product_description:
        return jsonify({'status': False, 'data': 'Missing required query parameters'})

    # List of sustainable features
    sustain_attributes = [
        'organic',
        'fair trade',
        'recyclable',
        'reusable',
        'renewable energy',
        'energy efficient',
        'sustainable packaging',
        'biodegradable/compostable',
        'low carbon footprint',
        'carbon neutral',
        'ethically sourced',
        'water conservation',
        'non-toxic',
        'cruelty-free',
        'upcycled',
        'locally produced',
        'social impact',
        'low/zero VOC'
    ]

    # Turn sustain_attributes array to string separated by comma
    sustainable_attributes_to_string = ','.join(sustain_attributes)

    # Create the prompt
    prompt = f"I have a product titled '{product_title}' and product description '{product_description}'. Match the product with sustainable attributes and explain why. Sustainable attributes: {sustainable_attributes_to_string}. If the product can't match any of the sustainable attributes, return False.\nReturn a dictionary like this: {{'attribute': 'Explanation'}}"
    response = openai.Completion.create(
        engine='text-davinci-003',
        prompt=prompt,
        max_tokens=1000,  # Increase max_tokens value to allow for longer responses
        n=13,  # Retrieve 13 choices for all sustainable attributes
        stop=None,
        temperature=0.5,  # Lower temperature for less randomness
        top_p=1.0,
        frequency_penalty=0.0,
        presence_penalty=0.0
    )
    choices = response.choices

    attributes = {}
    for choice in choices:
        result = choice.text.strip()
        result = result.replace("'", '"')
        try:
            attribute, explanation = list(json.loads(result).items())[0]
            attribute = attribute.lower() # make lower() to reduce same responses by gtp model
            attributes[attribute] = explanation
        except json.decoder.JSONDecodeError:
            # Handle JSON decoding error
            continue

    if len(attributes) == 0:
        attrs = {'status': False, 'data': 'Not sustainable.'}
    else:
        attrs = {'status': True, 'data': attributes}

    sustain_response = app.response_class(
        response=json.dumps(attrs),
        status=200,
        mimetype='application/json'
    )

    return sustain_response