import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { NodeChallenge, FolderTheme, QuizSession } from '../../models/node.model';

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {

    public db!: Dexie;

    constructor() { }

    get name(): string {
        return this.db ? this.db.name : '';
    }

    get tables(): Table<any, any>[] {
        return this.db ? this.db.tables : [];
    }

    async initializeVault(vaultName: string): Promise<void> {
        if (this.db) {
            this.db.close();
        }
        // Identificar el motor de BD disponible (compatibilidad con tests)
        const g = globalThis as any;
        const idb = g.indexedDB || g.window?.indexedDB;
        const idbKR = g.IDBKeyRange || g.window?.IDBKeyRange;

        this.db = new Dexie(vaultName, {
            indexedDB: idb,
            IDBKeyRange: idbKR
        });

        this.db.version(1).stores({
            nodes: '++id, content, sourceId, nextReviewDate',
            api_keys: '++id, provider, key',
            history: '++id, nodeId, date, grade',
            statistics: '++id, metric, value'
        });

        this.db.version(2).stores({
            nodes: '++id, id_temp, tipo_reto, folder_id, quiz_id, nextReviewDate',
            folders: 'folder_id, nombre_tema',
            quizzes: 'quiz_id, folder_id, titulo_quiz'
        });

        try {
            await this.db.open();
        } catch (err: any) {
            if (err.name === 'QuotaExceededError') {
                console.error('[DatabaseService] CRITICAL: QuotaExceededError. NodeMesh cannot save more nodes.');
            } else {
                console.error('[DatabaseService] Error opening IndexedDB:', err);
            }
            throw err;
        }
    }

    async saveApiKey(provider: string, encryptedKey: string): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.table('api_keys').put({ provider, key: encryptedKey });
    }

    async getApiKey(provider: string): Promise<string | null> {
        if (!this.db) throw new Error('Database not initialized');
        const record = await this.db.table('api_keys').where('provider').equals(provider).first();
        return record ? record.key : null;
    }

    async saveNodes(nodes: Omit<NodeChallenge, 'id'>[]): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.table('nodes').bulkAdd(nodes);
    }

    async getNodes(): Promise<NodeChallenge[]> {
        if (!this.db) throw new Error('Database not initialized');
        return await this.db.table('nodes').toArray();
    }

    async getNodesBySource(sourceId: string): Promise<NodeChallenge[]> {
        if (!this.db) throw new Error('Database not initialized');
        return await this.db.table('nodes').where('sourceId').equals(sourceId).toArray();
    }

    async saveFolder(folder: FolderTheme): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');
        await this.db.table('folders').put(folder);
    }

    async getDueNodesSummary(): Promise<{ folder_id: string, nombre_tema: string, count: number, status: 'overdue' | 'due' }[]> {
        if (!this.db) throw new Error('Database not initialized');
        
        const now = new Date();
        const dueNodes = await this.db.table('nodes')
            .where('nextReviewDate').below(now)
            .toArray();

        const summaryMap = new Map<string, { id: string, name: string, count: number, maxOverdue: Date }>();

        // Agrupar por folder_id
        for (const node of dueNodes) {
          const fid = node.folder_id || 'unassigned';
          if (!summaryMap.has(fid)) {
            const folder = await this.db.table('folders').get(fid);
            summaryMap.set(fid, { 
              id: fid, 
              name: folder?.nombre_tema || 'General', 
              count: 0,
              maxOverdue: node.nextReviewDate 
            });
          }
          const entry = summaryMap.get(fid)!;
          entry.count++;
          if (node.nextReviewDate < entry.maxOverdue) entry.maxOverdue = node.nextReviewDate;
        }

        return Array.from(summaryMap.values()).map(e => ({
          folder_id: e.id,
          nombre_tema: e.name,
          count: e.count,
          status: (now.getTime() - e.maxOverdue.getTime() > 86400000) ? 'overdue' : 'due'
        }));
    }

    async getDailyActivity(days: number = 30): Promise<{ date: string, count: number }[]> {
        if (!this.db) throw new Error('Database not initialized');
        
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - days);

        const history = await this.db.table('history')
            .where('date').above(threshold)
            .toArray();

        const activityMap = new Map<string, number>();
        
        // Inicializar últimos X días con 0
        for (let i = 0; i < days; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          activityMap.set(d.toISOString().split('T')[0], 0);
        }

        for (const entry of history) {
          const day = new Date(entry.date).toISOString().split('T')[0];
          if (activityMap.has(day)) {
            activityMap.set(day, (activityMap.get(day) || 0) + 1);
          }
        }

        return Array.from(activityMap.entries())
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
    }

    async getRecentFolders(limit: number = 3): Promise<FolderTheme[]> {
        if (!this.db) throw new Error('Database not initialized');
        // Ordenar por creado_en descendente (asumiendo que es la fecha de última actividad o creación relevante)
        return await this.db.table('folders')
            .orderBy('creado_en')
            .reverse()
            .limit(limit)
            .toArray();
    }

    async getMasteryRatio(): Promise<number> {
        if (!this.db) throw new Error('Database not initialized');
        const allNodes = await this.db.table('nodes').toArray();
        if (allNodes.length === 0) return 0;
        
        // Simulación: Si nextReviewDate es > 7 días en el futuro, se considera "dominado"
        const now = new Date();
        const masteryThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const seniorNodes = allNodes.filter(n => n.nextReviewDate && n.nextReviewDate > masteryThreshold);
        
        return (seniorNodes.length / allNodes.length) * 100;
    }

    async getRetentionProfile(): Promise<{ day: number, retention: number }[]> {
        // Curve de Ebbinghaus: R = e^(-t/S)
        // Generamos puntos para un gráfico de área (últimos 30 días)
        const profile = [];
        for (let i = 0; i < 30; i++) {
          const t = i; // días
          const s = 10; // estabilidad inicial (placeholder)
          const retention = Math.exp(-t / s);
          profile.push({ day: 30 - i, retention: retention * 100 });
        }
        return profile.reverse();
    }
}
