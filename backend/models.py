from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid


# Contact Form Model
class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    subject: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1, max_length=2000)


class Contact(ContactCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "new"  # new, read, responded


# Volunteer Application Model
class VolunteerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    opportunity: str = Field(..., min_length=1)
    message: Optional[str] = None


class Volunteer(VolunteerCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, approved, contacted


# Prayer Request Model
class PrayerRequestCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    request: str = Field(..., min_length=1, max_length=2000)
    isAnonymous: bool = False


class PrayerRequest(PrayerRequestCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "active"  # active, praying, answered
    display_name: Optional[str] = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.isAnonymous or not self.name:
            self.display_name = "Anonymous"
        else:
            self.display_name = self.name


# Donation Model (Placeholder - Stripe integration later)
class DonationCreate(BaseModel):
    amount: float = Field(..., gt=0)
    donation_type: str = Field(..., pattern="^(one-time|monthly)$")
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: Optional[str] = None


class Donation(DonationCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, completed, failed
    transaction_id: Optional[str] = None


# Encounter Lesson Model
class LessonCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    scripture_reference: Optional[str] = None
    video_url: Optional[str] = None
    published: bool = True


class Lesson(LessonCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    week_number: Optional[int] = None
    comment_count: int = 0


# Lesson Comment Model
class CommentCreate(BaseModel):
    lesson_id: str
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    comment: str = Field(..., min_length=1, max_length=1000)


class Comment(CommentCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approved: bool = True  # For moderation if needed


# Reading Revelation Model
class RevelationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    scripture_passage: str = Field(..., min_length=1, max_length=200)
    revelation: str = Field(..., min_length=1)
    personal_note: Optional[str] = None
    published: bool = True


class Revelation(RevelationCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    comment_count: int = 0


# Revelation Comment Model
class RevelationCommentCreate(BaseModel):
    revelation_id: str
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    comment: str = Field(..., min_length=1, max_length=1000)


class RevelationComment(RevelationCommentCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approved: bool = True
