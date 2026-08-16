from flask_pymongo import PyMongo

mongo = PyMongo()

def init_db(app):
    """Initialize the MongoDB connection with the Flask app."""
    # Ensure a reasonable timeout for server selection so we don't hang requests if MongoDB is offline
    uri = app.config.get('MONGO_URI', '')
    if uri and 'serverSelectionTimeoutMS' not in uri:
        if '?' in uri:
            app.config['MONGO_URI'] = f"{uri}&serverSelectionTimeoutMS=2000"
        else:
            app.config['MONGO_URI'] = f"{uri}?serverSelectionTimeoutMS=2000"
            
    mongo.init_app(app)
