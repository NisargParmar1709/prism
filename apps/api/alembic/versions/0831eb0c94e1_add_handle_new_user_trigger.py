"""add_handle_new_user_trigger

Revision ID: 0831eb0c94e1
Revises: 48e68c2bb658
Create Date: 2026-08-12 19:52:48.051266

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0831eb0c94e1'
down_revision: Union[str, Sequence[str], None] = '48e68c2bb658'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
        CREATE OR REPLACE FUNCTION public.handle_new_user() 
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO public.profiles (id, user_id, full_name, avatar_url, currency, onboarding_completed, created_at, updated_at)
          VALUES (
            gen_random_uuid(),
            new.id,
            new.profile->>'name',
            new.profile->>'avatar_url',
            'INR',
            false,
            now(),
            now()
          );
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    """)
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;")
    op.execute("""
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;")
    op.execute("DROP FUNCTION IF EXISTS public.handle_new_user();")
