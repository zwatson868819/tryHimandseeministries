from fastapi import APIRouter, HTTPException, status
from models import (
    Contact, ContactCreate,
    Volunteer, VolunteerCreate,
    PrayerRequest, PrayerRequestCreate,
    Donation, DonationCreate
)
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import os

router = APIRouter()

# Database will be injected via dependency
db: AsyncIOMotorDatabase = None


def set_database(database: AsyncIOMotorDatabase):
    global db
    db = database


# Contact Form Endpoints
@router.post("/contact", response_model=Contact, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(contact_data: ContactCreate):
    """Submit a contact form"""
    try:
        contact = Contact(**contact_data.dict())
        result = await db.contacts.insert_one(contact.dict())
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit contact form"
            )
        
        return contact
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting contact form: {str(e)}"
        )


@router.get("/contact", response_model=List[Contact])
async def get_contacts(limit: int = 50):
    """Get all contact form submissions (admin use)"""
    try:
        contacts = await db.contacts.find().sort("created_at", -1).limit(limit).to_list(limit)
        return [Contact(**contact) for contact in contacts]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching contacts: {str(e)}"
        )


# Volunteer Endpoints
@router.post("/volunteers", response_model=Volunteer, status_code=status.HTTP_201_CREATED)
async def submit_volunteer_application(volunteer_data: VolunteerCreate):
    """Submit a volunteer application"""
    try:
        volunteer = Volunteer(**volunteer_data.dict())
        result = await db.volunteers.insert_one(volunteer.dict())
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit volunteer application"
            )
        
        return volunteer
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting volunteer application: {str(e)}"
        )


@router.get("/volunteers", response_model=List[Volunteer])
async def get_volunteers(limit: int = 50):
    """Get all volunteer applications (admin use)"""
    try:
        volunteers = await db.volunteers.find().sort("created_at", -1).limit(limit).to_list(limit)
        return [Volunteer(**volunteer) for volunteer in volunteers]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching volunteers: {str(e)}"
        )


# Prayer Request Endpoints
@router.post("/prayer-requests", response_model=PrayerRequest, status_code=status.HTTP_201_CREATED)
async def submit_prayer_request(prayer_data: PrayerRequestCreate):
    """Submit a prayer request"""
    try:
        prayer_request = PrayerRequest(**prayer_data.dict())
        
        # Prepare data for storage (exclude sensitive info for anonymous requests)
        storage_data = prayer_request.dict()
        if prayer_request.isAnonymous:
            storage_data['name'] = None
            storage_data['email'] = None
        
        result = await db.prayer_requests.insert_one(storage_data)
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit prayer request"
            )
        
        return prayer_request
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting prayer request: {str(e)}"
        )


@router.get("/prayer-requests", response_model=List[PrayerRequest])
async def get_prayer_requests(limit: int = 10, public: bool = True):
    """Get prayer requests for the community wall"""
    try:
        query = {"status": "active"}
        
        prayers = await db.prayer_requests.find(query).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Return only public-safe data
        result = []
        for prayer in prayers:
            prayer_obj = PrayerRequest(**prayer)
            if public:
                # For public display, use display_name and hide email
                prayer_dict = prayer_obj.dict()
                prayer_dict['email'] = None
                result.append(PrayerRequest(**prayer_dict))
            else:
                result.append(prayer_obj)
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching prayer requests: {str(e)}"
        )


# Donation Endpoints (Placeholder - Stripe integration later)
@router.post("/donations", response_model=Donation, status_code=status.HTTP_201_CREATED)
async def submit_donation(donation_data: DonationCreate):
    """Submit a donation (placeholder - Stripe integration pending)"""
    try:
        donation = Donation(**donation_data.dict())
        
        # TODO: Integrate with Stripe payment processing
        # For now, just store the donation intent
        donation.status = "pending"
        
        result = await db.donations.insert_one(donation.dict())
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record donation"
            )
        
        return donation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting donation: {str(e)}"
        )


@router.get("/donations", response_model=List[Donation])
async def get_donations(limit: int = 50):
    """Get all donations (admin use)"""
    try:
        donations = await db.donations.find().sort("created_at", -1).limit(limit).to_list(limit)
        return [Donation(**donation) for donation in donations]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching donations: {str(e)}"
        )


# Stats Endpoint
@router.get("/stats")
async def get_ministry_stats():
    """Get ministry statistics for dashboard"""
    try:
        total_contacts = await db.contacts.count_documents({})
        total_volunteers = await db.volunteers.count_documents({})
        total_prayers = await db.prayer_requests.count_documents({})
        total_donations = await db.donations.count_documents({"status": "completed"})
        
        # Calculate total donation amount
        pipeline = [
            {"$match": {"status": "completed"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        donation_sum = await db.donations.aggregate(pipeline).to_list(1)
        total_donation_amount = donation_sum[0]['total'] if donation_sum else 0
        
        return {
            "total_contacts": total_contacts,
            "total_volunteers": total_volunteers,
            "total_prayer_requests": total_prayers,
            "total_donations": total_donations,
            "total_donation_amount": total_donation_amount
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching stats: {str(e)}"
        )
