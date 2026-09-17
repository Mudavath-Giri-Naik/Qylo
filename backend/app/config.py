import os


class Settings:
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


settings = Settings()
