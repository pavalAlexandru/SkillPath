import { getCurrentStudentLevel } from '@/server/supabase/profileService';
import { getCategoriesByLevel } from '@/server/supabase/categoryService';
import { getUserCategoryProgress } from '@/server/supabase/assessmentService';
import { SurpriseModeBanner } from '@/components/assessment/SurpriseModeBanner';
import { CategoryCard } from '@/components/assessment/CategoryCard';
import { LockedCategoryCard } from '@/components/assessment/LockedCategoryCard';

export const dynamic = 'force-dynamic';

export default async function AssessmentPage() {
    const userLevel = await getCurrentStudentLevel();
    const categories = await getCategoriesByLevel(userLevel);
    const progressMap = await getUserCategoryProgress();

    return (
        <div className="space-y-8 pb-12">
            {/* Header Nivel */}
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Learning Path</h1>
                <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-bold text-indigo-700 tracking-wide uppercase">
                    {userLevel}
                </span>
            </div>

            {/* Banner Surprise Mode */}
            <SurpriseModeBanner />

            {/* Grila de Categorii Active cu Date Reale */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                    <CategoryCard
                        key={cat.id}
                        id={cat.id}
                        name={cat.name}
                        description={cat.description || ''}
                        level={cat.level}
                        progress={progressMap[cat.id]}
                    />
                ))}

                {/* Carduri Blocate dacă studentul e încă Junior */}
                {userLevel === 'JUNIOR' && (
                    <>
                        <LockedCategoryCard
                            title="Design Patterns"
                            description="Creational, structural, and behavioral patterns for solving common design problems."
                            levelBadge="MIDDLE"
                            unlockRequirement="Unlocks at 90% on all Junior categories"
                        />
                        <LockedCategoryCard
                            title="API & REST"
                            description="Designing and consuming RESTful web services, authentication, and stateless architecture."
                            levelBadge="MIDDLE"
                            unlockRequirement="Unlocks at 90% on all Junior categories"
                        />
                    </>
                )}
            </div>
        </div>
    );
}