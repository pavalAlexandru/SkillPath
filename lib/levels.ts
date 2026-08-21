export const LEVELS= ['JUNIOR','MIDDLE','SENIOR'] as const;
export type Level=(typeof LEVELS)[number]; //tipul elementelor de la orice index numeric din array-ul LEVELS”

export const PASS_THRESHOLD=90;
export const LEVEL_LABEL: Record <Level,string>= {
    JUNIOR :'Junior',
    MIDDLE : 'Middle',
    SENIOR : 'Senior',

};

export function nextLevel(level: Level): Level | null {
    if (level === 'JUNIOR') return 'MIDDLE';
    if (level === 'MIDDLE') return 'SENIOR';
    return null; // SENIOR e ultimul nivel
}

export function getAccessibleLevels(level: Level): Level[] {
    if (level === 'JUNIOR') return ['JUNIOR'];
    if (level === 'MIDDLE') return ['JUNIOR', 'MIDDLE'];
    if (level === 'SENIOR') return ['JUNIOR', 'MIDDLE', 'SENIOR'];
    return ['JUNIOR'];
}
//aici tb modificat daca adaugam un level nou


