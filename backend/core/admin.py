from django.contrib import admin
from .models import Activity, Profile, Game, AIGeneration
@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'visibility', 'published', 'created_at']
    list_filter = ['published', 'visibility', 'subject']
    search_fields = ['title', 'creator__email']
admin.site.register(Profile)
admin.site.register(Game)
admin.site.register(AIGeneration)
admin.site.site_header = 'Entrelaços · Administração'
