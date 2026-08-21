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

            {/* Grila de Categorii Active */}
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

                {/* Carduri blocate când ești JUNIOR -> spre MIDDLE */}
                {userLevel === 'JUNIOR' && (
                    <>
                        <LockedCategoryCard
                            title="SOLID & Design Patterns"
                            description="Principii avansate de design orientat pe obiecte și șabloane arhitecturale."
                            levelBadge="MIDDLE"
                            unlockRequirement="Unlocks at 90% on all Junior categories"
                        />
                        <LockedCategoryCard
                            title="Web Development & REST APIs"
                            description="Arhitectura web, protocoale HTTP, servicii RESTful și securitate web."
                            levelBadge="MIDDLE"
                            unlockRequirement="Unlocks at 90% on all Junior categories"
                        />
                    </>
                )}

                {/* Carduri blocate când ești MIDDLE -> spre SENIOR */}
                {userLevel === 'MIDDLE' && (
                    <>
                        <LockedCategoryCard
                            title="Distributed Systems & Microservices"
                            description="Arhitecturi distribuite, consistență eventuală, event-driven systems și scalabilitate."
                            levelBadge="SENIOR"
                            unlockRequirement="Unlocks at 90% on all Middle categories"
                        />
                        <LockedCategoryCard
                            title="High Performance & Database Tuning"
                            description="Optimizare query-uri, mecanisme avansate de indexare, caching distribuit și concurență."
                            levelBadge="SENIOR"
                            unlockRequirement="Unlocks at 90% on all Middle categories"
                        />
                    </>
                )}
            </div>
        </div>
    );
}