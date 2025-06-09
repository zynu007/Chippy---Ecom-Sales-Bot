from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from . import firestore_utils


class ChatHistoryAPIView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):

        user_id = str(request.user.id)
        history = firestore_utils.get_chat_history(user_id)
        return Response(history, status=status.HTTP_200_OK)
    

    def post(self, request, *args, **kwargs):

        user_id = str(request.user.id)
        message_text = request.data.get('message')
        sender = request.data.get('sender')
        client_timestamp = request.data.get('timestamp')


        if not message_text or not sender:
            return Response(
                {"detail": "Message and sender are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        doc_id = firestore_utils.save_chat_message(user_id, message_text, sender, client_timestamp)
        if doc_id:
            return Response(
                {"detail": "Message saved successfully.", "doc_id": doc_id},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {"detail": "Failed to save message."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    def delete(self, request, *args, **kwargs):
        """
        Clears all chat history for the authenticated user.
        """
        user_id = str(request.user.id)
        success = firestore_utils.clear_chat_history(user_id)
        if success:
            return Response(
                {"detail": "Chat history cleared successfully."},
                status=status.HTTP_204_NO_CONTENT # No content to return after successful deletion
            )
        return Response(
            {"detail": "Failed to clear chat history."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )