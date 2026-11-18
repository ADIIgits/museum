from rest_framework import generics, permissions
from .models import Museum
from .serializers import MuseumSerializer


class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to users with role='admin' or staff status."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (getattr(request.user, 'role', '') == 'admin' or request.user.is_staff)
        )


class MuseumListView(generics.ListCreateAPIView):
    """
    GET  /api/museums/       — list all active museums (Public).
    POST /api/museums/       — operator/admin creates a new museum listing.
    """
    queryset = Museum.objects.filter(is_active=True)
    serializer_class = MuseumSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(operator=self.request.user)


class OperatorMuseumListView(generics.ListAPIView):
    """
    GET /api/museums/my/ — list museums managed by the authenticated operator.
    """
    serializer_class = MuseumSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return Museum.objects.filter(operator=self.request.user)


class MuseumDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/museums/<id>/  — single museum detail (Public).
    PUT/PATCH/DELETE           — only the managing operator can modify/delete.
    """
    queryset = Museum.objects.all()
    serializer_class = MuseumSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def perform_update(self, serializer):
        # Ensure only the owning operator or staff can update
        museum = self.get_object()
        if museum.operator != self.request.user and not self.request.user.is_staff:
            raise permissions.exceptions.PermissionDenied("You do not manage this museum.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.operator != self.request.user and not self.request.user.is_staff:
            raise permissions.exceptions.PermissionDenied("You do not manage this museum.")
        instance.delete()
