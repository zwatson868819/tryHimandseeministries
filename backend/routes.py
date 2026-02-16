from fastapi import APIRouter, HTTPException, status
from models import (
    Contact, ContactCreate,
    Volunteer, VolunteerCreate,
    PrayerRequest, PrayerRequestCreate,
    Donation, DonationCreate,
    Lesson, LessonCreate,
    Comment, CommentCreate
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


# Encounter Lesson Endpoints
@router.post("/lessons", response_model=Lesson, status_code=status.HTTP_201_CREATED)
async def create_lesson(lesson_data: LessonCreate):
    """Create a new encounter lesson (admin use)"""
    try:
        lesson = Lesson(**lesson_data.dict())
        
        # Calculate week number based on total lessons
        total_lessons = await db.lessons.count_documents({})
        lesson.week_number = total_lessons + 1
        
        result = await db.lessons.insert_one(lesson.dict())
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create lesson"
            )
        
        return lesson
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating lesson: {str(e)}"
        )


@router.get("/lessons", response_model=List[Lesson])
async def get_lessons(limit: int = 50, published_only: bool = True):
    """Get all encounter lessons"""
    try:
        query = {"published": True} if published_only else {}
        lessons = await db.lessons.find(query).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Get comment count for each lesson
        result = []
        for lesson in lessons:
            lesson_obj = Lesson(**lesson)
            comment_count = await db.comments.count_documents({"lesson_id": lesson_obj.id})
            lesson_obj.comment_count = comment_count
            result.append(lesson_obj)
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching lessons: {str(e)}"
        )


@router.get("/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str):
    """Get a specific lesson by ID"""
    try:
        lesson = await db.lessons.find_one({"id": lesson_id})
        
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found"
            )
        
        lesson_obj = Lesson(**lesson)
        comment_count = await db.comments.count_documents({"lesson_id": lesson_id})
        lesson_obj.comment_count = comment_count
        
        return lesson_obj
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching lesson: {str(e)}"
        )


# Lesson Comment Endpoints
@router.post("/comments", response_model=Comment, status_code=status.HTTP_201_CREATED)
async def create_comment(comment_data: CommentCreate):
    """Submit a comment on a lesson"""
    try:
        # Verify lesson exists
        lesson = await db.lessons.find_one({"id": comment_data.lesson_id})
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found"
            )
        
        comment = Comment(**comment_data.dict())
        result = await db.comments.insert_one(comment.dict())
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit comment"
            )
        
        return comment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting comment: {str(e)}"
        )


@router.get("/comments/{lesson_id}", response_model=List[Comment])
async def get_comments(lesson_id: str, limit: int = 100):
    """Get all comments for a specific lesson"""
    try:
        query = {"lesson_id": lesson_id, "approved": True}
        comments = await db.comments.find(query).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Hide email addresses for public display
        result = []
        for comment in comments:
            comment_obj = Comment(**comment)
            comment_obj.email = None  # Hide email for privacy
            result.append(comment_obj)
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching comments: {str(e)}"
        )
