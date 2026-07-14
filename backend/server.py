from fastapi import FastAPI, APIRouter
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Load environment variables FIRST before importing routes
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Now import routes after env vars are loaded
from routes import router as ministry_router, set_database

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Set database for routes
set_database(db)

# Create the main app without a prefix
app = FastAPI(title="tryHimandsee Ministries API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {
        "message": "tryHimandsee Ministries API",
        "status": "running",
        "version": "1.0.0"
    }

# Temporary one-off download for Cloudflare Pages deployment build artifact
@api_router.get("/download/cloudflare-build")
async def download_cloudflare_build():
    return FileResponse(
        path="/app/tryhimandsee-cloudflare-build.zip",
        filename="tryhimandsee-cloudflare-build.zip",
        media_type="application/zip"
    )

# Temporary one-off download for the Cloudflare Workers backend project
@api_router.get("/download/cloudflare-backend")
async def download_cloudflare_backend():
    return FileResponse(
        path="/app/tryhimandsee-cloudflare-backend.zip",
        filename="tryhimandsee-cloudflare-backend.zip",
        media_type="application/zip"
    )

# Temporary one-off download for the dashboard-only deployment (worker.js + schema.sql + guide)
@api_router.get("/download/cloudflare-dashboard")
async def download_cloudflare_dashboard():
    return FileResponse(
        path="/app/tryhimandsee-cloudflare-dashboard.zip",
        filename="tryhimandsee-cloudflare-dashboard.zip",
        media_type="application/zip"
    )

# Worker JS as plain text in browser (copy/paste)
@api_router.get("/download/worker-js")
async def view_worker_js():
    return FileResponse(
        path="/app/cf-dashboard-deploy/worker.js",
        media_type="text/plain"
    )

# Schema SQL as plain text in browser (copy/paste)
@api_router.get("/download/schema-sql")
async def view_schema_sql():
    return FileResponse(
        path="/app/cf-dashboard-deploy/schema.sql",
        media_type="text/plain"
    )

# Blog migration SQL (just the new table)
@api_router.get("/download/blog-migration-sql")
async def view_blog_migration_sql():
    return FileResponse(
        path="/app/cf-dashboard-deploy/blog-migration.sql",
        media_type="text/plain"
    )

# Subscribers migration SQL (newsletter signups table)
@api_router.get("/download/subscribers-migration-sql")
async def view_subscribers_migration_sql():
    return FileResponse(
        path="/app/cf-dashboard-deploy/subscribers-migration.sql",
        media_type="text/plain"
    )

# Testimonies migration SQL (visitor-submitted stories)
@api_router.get("/download/testimonies-migration-sql")
async def view_testimonies_migration_sql():
    return FileResponse(
        path="/app/cf-dashboard-deploy/testimonies-migration.sql",
        media_type="text/plain"
    )

# Goal thermometer migration SQL (settings table for monthly donation goal)
@api_router.get("/download/goal-migration-sql")
async def view_goal_migration_sql():
    return FileResponse(
        path="/app/cf-dashboard-deploy/goal-migration.sql",
        media_type="text/plain"
    )

# Loving You Back To Life CRM migration SQL
@api_router.get("/download/lybtl-migration-sql")
async def view_lybtl_migration_sql():
    return FileResponse(
        path="/app/cf-dashboard-deploy/lybtl-migration.sql",
        media_type="text/plain"
    )

# Site enhancements migration (Prayer Wall counter + Impact stats)
@api_router.get("/download/site-enhancements-migration-sql")
async def view_site_enhancements_migration_sql():
    return FileResponse(
        path="/app/cf-dashboard-deploy/site-enhancements-migration.sql",
        media_type="text/plain"
    )

# Candle Wall migration
@api_router.get("/download/candles-migration-sql")
async def view_candles_migration_sql():
    return FileResponse(
        path="/app/cf-dashboard-deploy/candles-migration.sql",
        media_type="text/plain"
    )

# Include ministry routes
api_router.include_router(ministry_router, tags=["ministry"])

# ---------------------------------------------------------------------------
# Compatibility stubs for endpoints that only exist on the Cloudflare Worker
# (production backend). They return the same shape as the Worker so the React
# frontend doesn't log 404s in the dev preview environment. The legacy FastAPI
# backend is read-only for these endpoints — real data lives in Cloudflare D1.
# ---------------------------------------------------------------------------
from datetime import datetime, timezone

@api_router.get("/testimonies")
async def stub_testimonies(limit: int = 20):
    return []

@api_router.get("/donations/progress")
async def stub_donation_progress():
    now = datetime.now(timezone.utc)
    return {
        "goal": 500,
        "raised": 0,
        "percent": 0,
        "month": now.strftime("%B %Y"),
    }

@api_router.get("/stats/impact")
async def stub_impact_stats():
    return {
        "lives_touched": 0,
        "kits_given": 0,
        "miracle_runs": 0,
        "total_donations": 0,
    }

@api_router.post("/notary-requests")
async def stub_notary_create(payload: dict):
    # In production the Cloudflare Worker persists to D1 and emails via Resend.
    # This preview stub simply echoes the payload back so the form flow works.
    from fastapi import HTTPException
    if not payload.get("name") or not payload.get("phone"):
        raise HTTPException(status_code=400, detail="Name and phone are required")
    from uuid import uuid4
    return {
        "id": str(uuid4()),
        **payload,
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

@api_router.get("/admin/notary-requests")
async def stub_notary_list():
    return []

# ---------- Resource Directory (preview stub) ----------
# In production, the Cloudflare Worker persists to D1. Here we hold state in
# memory so the admin CRUD flow is exercisable in preview.
from resources_seed import get_seed_resources
_RESOURCES_CACHE = {r["id"]: dict(r) for r in get_seed_resources()}

@api_router.get("/resources")
async def stub_resources_public(category: str | None = None):
    items = [r for r in _RESOURCES_CACHE.values() if r.get("is_active", 1)]
    if category:
        items = [r for r in items if r.get("category") == category]
    items.sort(key=lambda r: (r.get("sort_order", 0), r.get("name", "")))
    return items

@api_router.get("/admin/resources")
async def stub_resources_admin():
    items = list(_RESOURCES_CACHE.values())
    items.sort(key=lambda r: (r.get("category", ""), r.get("sort_order", 0), r.get("name", "")))
    return items

@api_router.post("/admin/resources")
async def stub_resources_create(payload: dict):
    from fastapi import HTTPException
    from uuid import uuid4
    if not payload.get("category") or not payload.get("name"):
        raise HTTPException(status_code=400, detail="Category and name are required")
    now_iso = datetime.now(timezone.utc).isoformat()
    new_id = str(uuid4())
    record = {
        "id": new_id,
        "category": payload["category"],
        "name": payload["name"],
        "description": payload.get("description", ""),
        "address": payload.get("address", ""),
        "phone": payload.get("phone", ""),
        "website": payload.get("website", ""),
        "hours": payload.get("hours", ""),
        "notes": payload.get("notes", ""),
        "sort_order": int(payload.get("sort_order", 999)) if str(payload.get("sort_order", 999)).lstrip("-").isdigit() else 999,
        "is_active": 0 if payload.get("is_active") is False else 1,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    _RESOURCES_CACHE[new_id] = record
    return record

@api_router.put("/admin/resources/{rid}")
async def stub_resources_update(rid: str, payload: dict):
    from fastapi import HTTPException
    if rid not in _RESOURCES_CACHE:
        raise HTTPException(status_code=404, detail="Resource not found")
    record = _RESOURCES_CACHE[rid]
    for key in ["category", "name", "description", "address", "phone", "website", "hours", "notes"]:
        if key in payload:
            record[key] = payload[key] or ""
    if "sort_order" in payload:
        try:
            record["sort_order"] = int(payload["sort_order"])
        except (TypeError, ValueError):
            pass
    if "is_active" in payload:
        record["is_active"] = 0 if payload["is_active"] is False else 1
    record["updated_at"] = datetime.now(timezone.utc).isoformat()
    return record

@api_router.delete("/admin/resources/{rid}")
async def stub_resources_delete(rid: str):
    _RESOURCES_CACHE.pop(rid, None)
    return {"ok": True}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()