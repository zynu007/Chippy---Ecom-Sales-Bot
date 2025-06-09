from django.conf import settings
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
import uuid
from datetime import datetime
import os

# Get the Firestore client instance from Django settings
db = settings.FIRESTORE_DB

if not db:
    print("ERROR: Firestore client is not initialized in settings.py. Chat history will not work.")


def get_user_chat_collection_ref(user_id):
    app_id = getattr(settings, 'APP_ID', 'default-app-id') # Get APP_ID from settings, fallback for local testing
    if not app_id:
        app_id = os.environ.get('__app_id', 'default-app-id')
    return db.collection('artifacts').document(app_id).collection('users').document(user_id).collection('chat_history')


def save_chat_message(user_id, message_text, sender, timestamp):
    if not db: return None #Handle uninitialized db

    try:
        chat_ref = get_user_chat_collection_ref(user_id)
        message_data = {
            'message': message_text,
            'sender': sender,
            'timestamp': firestore.SERVER_TIMESTAMP, # Use Firestore's server timestamp for consistency
            'client_timestamp': timestamp # Store client-side timestamp as well
        }
        doc_ref = chat_ref.add(message_data)
        return doc_ref[1].id # Return the ID of the new document
    except Exception as e:
        print(f"Error saving chat message for user {user_id}: {e}")
        return None

def get_chat_history(user_id):
    """
    Retrieves all chat messages for a given user, ordered by timestamp.
    Returns a list of dictionaries.
    """
    if not db: return []

    try:
        chat_ref = get_user_chat_collection_ref(user_id)
        messages = chat_ref.order_by('timestamp').stream()
        history = []
        for msg_doc in messages:
            data = msg_doc.to_dict()
            # Convert Firestore Timestamp objects to readable strings if needed for display
            if isinstance(data.get('timestamp'), datetime):
                data['timestamp'] = data['timestamp'].isoformat() # Convert to ISO string
            history.append(data)
        return history
    except Exception as e:
        print(f"Error fetching chat history for user {user_id}: {e}")
        return []

def clear_chat_history(user_id):
    """
    Deletes all chat messages for a given user.
    """
    if not db: return False

    try:
        chat_ref = get_user_chat_collection_ref(user_id)
        # Delete documents in batches (Firestore recommends this for large collections)
        #getch all documents in the collection
        docs = chat_ref.stream()
        for doc in docs:
            doc.reference.delete()
        return True
    except Exception as e:
        print(f"Error clearing chat history for user {user_id}: {e}")
        return False

def generate_unique_user_id_for_anon():
    """
    Generates a unique ID for anonymous users, useful for local testing when auth is not set up.
    In Canvas, use request.auth.uid for authenticated users.
    """
    return str(uuid.uuid4())