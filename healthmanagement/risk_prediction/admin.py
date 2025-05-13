from django.contrib import admin
from .models import RiskAssessment

@admin.register(RiskAssessment)
class RiskAssessmentAdmin(admin.ModelAdmin):
    list_display = ('risk_assessment_id', 'user', 'condition', 'risk_score', 'created_at')
    list_filter = ('condition', 'created_at')
    search_fields = ('user__email', 'condition')
    readonly_fields = ('risk_assessment_id', 'created_at')
