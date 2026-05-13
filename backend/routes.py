from fastapi import APIRouter, HTTPException, status
from models import (
    Contact, ContactCreate,
    Volunteer, VolunteerCreate,
    PrayerRequest, PrayerRequestCreate,
    Donation, DonationCreate,
    Lesson, LessonCreate,
    Comment, CommentCreate,
    Revelation, RevelationCreate,
    RevelationComment, RevelationCommentCreate
)
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from datetime import datetime
from uuid import uuid4
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
        
        # Use aggregation to get comment counts efficiently
        pipeline = [
            {"$match": query},
            {"$sort": {"created_at": -1}},
            {"$limit": limit},
            {
                "$lookup": {
                    "from": "comments",
                    "localField": "id",
                    "foreignField": "lesson_id",
                    "as": "comments"
                }
            },
            {
                "$addFields": {
                    "comment_count": {"$size": "$comments"}
                }
            },
            {"$project": {"comments": 0}}  # Remove the comments array, keep only count
        ]
        
        lessons = await db.lessons.aggregate(pipeline).to_list(limit)
        return [Lesson(**lesson) for lesson in lessons]
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


# Reading Revelation Endpoints
@router.post("/revelations", response_model=Revelation, status_code=status.HTTP_201_CREATED)
async def create_revelation(revelation_data: RevelationCreate):
    """Create a new revelation post (admin use)"""
    try:
        revelation = Revelation(**revelation_data.dict())
        result = await db.revelations.insert_one(revelation.dict())
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create revelation"
            )
        
        return revelation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating revelation: {str(e)}"
        )


@router.get("/revelations", response_model=List[Revelation])
async def get_revelations(limit: int = 50, published_only: bool = True):
    """Get all revelation posts"""
    try:
        query = {"published": True} if published_only else {}
        
        # Use aggregation to get comment counts efficiently
        pipeline = [
            {"$match": query},
            {"$sort": {"created_at": -1}},
            {"$limit": limit},
            {
                "$lookup": {
                    "from": "revelation_comments",
                    "localField": "id",
                    "foreignField": "revelation_id",
                    "as": "comments"
                }
            },
            {
                "$addFields": {
                    "comment_count": {"$size": "$comments"}
                }
            },
            {"$project": {"comments": 0}}  # Remove the comments array, keep only count
        ]
        
        revelations = await db.revelations.aggregate(pipeline).to_list(limit)
        return [Revelation(**revelation) for revelation in revelations]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching revelations: {str(e)}"
        )


@router.get("/revelations/{revelation_id}", response_model=Revelation)
async def get_revelation(revelation_id: str):
    """Get a specific revelation by ID"""
    try:
        revelation = await db.revelations.find_one({"id": revelation_id})
        
        if not revelation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Revelation not found"
            )
        
        revelation_obj = Revelation(**revelation)
        comment_count = await db.revelation_comments.count_documents({"revelation_id": revelation_id})
        revelation_obj.comment_count = comment_count
        
        return revelation_obj
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching revelation: {str(e)}"
        )


# Revelation Comment Endpoints
@router.post("/revelation-comments", response_model=RevelationComment, status_code=status.HTTP_201_CREATED)
async def create_revelation_comment(comment_data: RevelationCommentCreate):
    """Submit a comment on a revelation post"""
    try:
        # Verify revelation exists
        revelation = await db.revelations.find_one({"id": comment_data.revelation_id})
        if not revelation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Revelation not found"
            )
        
        comment = RevelationComment(**comment_data.dict())
        result = await db.revelation_comments.insert_one(comment.dict())
        
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


@router.get("/revelation-comments/{revelation_id}", response_model=List[RevelationComment])
async def get_revelation_comments(revelation_id: str, limit: int = 100):
    """Get all comments for a specific revelation"""
    try:
        query = {"revelation_id": revelation_id, "approved": True}
        comments = await db.revelation_comments.find(query).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Hide email addresses for public display
        result = []
        for comment in comments:
            comment_obj = RevelationComment(**comment)
            comment_obj.email = None  # Hide email for privacy
            result.append(comment_obj)
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching comments: {str(e)}"
        )


# Stripe Payment Integration
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from fastapi import Request
from typing import Dict

# Define fixed donation packages for security
DONATION_PACKAGES = {
    "small": 25.0,
    "medium": 50.0,
    "large": 100.0,
    "xlarge": 250.0,
    "premium": 500.0
}


@router.post("/payments/checkout", response_model=CheckoutSessionResponse)
async def create_donation_checkout(
    request: Request,
    package_id: str = None,
    amount: float = None,
    donation_type: str = "one-time",
    name: str = "",
    email: str = "",
    message: str = None,
    origin_url: str = ""
):
    """Create a Stripe checkout session for donations"""
    try:
        # Get Stripe API key from environment
        stripe_api_key = os.environ.get('STRIPE_API_KEY')
        if not stripe_api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stripe API key not configured"
            )
        
        # Determine the donation amount
        if package_id and package_id in DONATION_PACKAGES:
            final_amount = DONATION_PACKAGES[package_id]
        elif amount and amount > 0:
            final_amount = float(amount)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide a valid donation amount or package"
            )
        
        # Build success and cancel URLs from frontend origin
        if not origin_url:
            origin_url = str(request.base_url).rstrip('/')
            # Remove /api from the base URL if present
            origin_url = origin_url.replace('/api', '')
        
        success_url = f"{origin_url}/donate?session_id={{CHECKOUT_SESSION_ID}}&success=true"
        cancel_url = f"{origin_url}/donate?canceled=true"
        
        # Initialize Stripe Checkout
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        # Create checkout session request
        checkout_request = CheckoutSessionRequest(
            amount=final_amount,
            currency="usd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "donation_type": donation_type,
                "donor_name": name,
                "donor_email": email,
                "source": "tryHimandsee_ministries"
            },
            payment_methods=["card"]
        )
        
        # Create the checkout session with Stripe
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record in database
        payment_transaction = {
            "id": str(uuid.uuid4()),
            "session_id": session.session_id,
            "amount": final_amount,
            "currency": "usd",
            "donation_type": donation_type,
            "name": name,
            "email": email,
            "message": message,
            "payment_status": "pending",
            "status": "initiated",
            "metadata": checkout_request.metadata,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.payment_transactions.insert_one(payment_transaction)
        
        return session
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating checkout session: {str(e)}"
        )


@router.get("/payments/checkout/status/{session_id}", response_model=CheckoutStatusResponse)
async def get_payment_status(session_id: str):
    """Get the status of a payment checkout session"""
    try:
        # Get Stripe API key
        stripe_api_key = os.environ.get('STRIPE_API_KEY')
        if not stripe_api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stripe API key not configured"
            )
        
        # Initialize Stripe Checkout
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        
        # Get checkout status from Stripe
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update payment transaction in database
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        
        if transaction:
            # Only update if status has changed to prevent duplicate processing
            if transaction["payment_status"] != checkout_status.payment_status:
                update_data = {
                    "payment_status": checkout_status.payment_status,
                    "status": "completed" if checkout_status.payment_status == "paid" else "failed" if checkout_status.status == "expired" else "processing",
                    "updated_at": datetime.utcnow()
                }
                
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": update_data}
                )
                
                # If payment is successful, also create a donation record
                if checkout_status.payment_status == "paid" and transaction.get("payment_status") != "paid":
                    donation_record = {
                        "id": str(uuid.uuid4()),
                        "amount": transaction["amount"],
                        "donation_type": transaction["donation_type"],
                        "name": transaction["name"],
                        "email": transaction["email"],
                        "message": transaction.get("message"),
                        "status": "completed",
                        "transaction_id": session_id,
                        "created_at": datetime.utcnow()
                    }
                    await db.donations.insert_one(donation_record)
        
        return checkout_status
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching payment status: {str(e)}"
        )


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    try:
        # Get Stripe API key
        stripe_api_key = os.environ.get('STRIPE_API_KEY')
        if not stripe_api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stripe API key not configured"
            )
        
        # Get raw body and signature
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        if not signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Stripe signature"
            )
        
        # Initialize Stripe Checkout
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        
        # Handle the webhook
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update payment transaction based on webhook event
        if webhook_response.session_id:
            transaction = await db.payment_transactions.find_one({"session_id": webhook_response.session_id})
            
            if transaction:
                update_data = {
                    "payment_status": webhook_response.payment_status,
                    "status": "completed" if webhook_response.payment_status == "paid" else "processing",
                    "updated_at": datetime.utcnow()
                }
                
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": update_data}
                )
                
                # Create donation record if payment successful and not already created
                if webhook_response.payment_status == "paid":
                    existing_donation = await db.donations.find_one({"transaction_id": webhook_response.session_id})
                    if not existing_donation:
                        donation_record = {
                            "id": str(uuid.uuid4()),
                            "amount": transaction["amount"],
                            "donation_type": transaction["donation_type"],
                            "name": transaction["name"],
                            "email": transaction["email"],
                            "message": transaction.get("message"),
                            "status": "completed",
                            "transaction_id": webhook_response.session_id,
                            "created_at": datetime.utcnow()
                        }
                        await db.donations.insert_one(donation_record)
        
        return {"status": "success", "event_id": webhook_response.event_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing webhook: {str(e)}"
        )
