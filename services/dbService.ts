
import { User, ExamAttempt } from '../types';

const DB_NAME = 'UPCursosDB_V6'; // Versão atualizada para garantir limpeza de esquemas antigos
const DB_VERSION = 6;
const STORE_USERS = 'users';
const STORE_HISTORY = 'history';

export class DatabaseService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        console.log("💾 DB: Sincronizando estrutura de dados vital...");
        
        if (!db.objectStoreNames.contains(STORE_USERS)) {
          db.createObjectStore(STORE_USERS, { keyPath: 'cpf' });
        }
        if (!db.objectStoreNames.contains(STORE_HISTORY)) {
          db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        console.log("✅ DB: Sistema de arquivos local pronto.");
        resolve();
      };

      request.onerror = (event: any) => {
        console.error('❌ DB: Erro crítico de inicialização:', event.target.error);
        reject(event.target.error);
      };
    });

    return this.initPromise;
  }

  async saveUser(user: User): Promise<void> {
    console.log(`💾 DB: Registrando/Atualizando dados de ${user.name}...`);
    return this.performTransaction(STORE_USERS, 'readwrite', (store) => store.put(user));
  }

  async deleteUser(cpf: string): Promise<void> {
    return this.performTransaction(STORE_USERS, 'readwrite', (store) => store.delete(cpf));
  }

  async getAllUsers(): Promise<User[]> {
    return this.performTransaction<User[]>(STORE_USERS, 'readonly', (store) => store.getAll());
  }

  async saveExamAttempt(attempt: ExamAttempt): Promise<void> {
    return this.performTransaction(STORE_HISTORY, 'readwrite', (store) => store.put(attempt));
  }

  async deleteExamAttempt(id: string): Promise<void> {
    return this.performTransaction(STORE_HISTORY, 'readwrite', (store) => store.delete(id));
  }

  async deleteUserHistory(cpf: string): Promise<void> {
    const all = await this.getAllHistory();
    const toDelete = all.filter(h => h.userCpf === cpf);
    for (const item of toDelete) {
      await this.deleteExamAttempt(item.id);
    }
  }

  async getAllHistory(): Promise<ExamAttempt[]> {
    return this.performTransaction<ExamAttempt[]>(STORE_HISTORY, 'readonly', (store) => store.getAll());
  }

  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest
  ): Promise<T> {
    await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB não inicializado');

      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      let result: any;

      request.onsuccess = () => {
        result = request.result;
      };

      transaction.oncomplete = () => {
        resolve(result);
      };

      transaction.onerror = () => {
        console.error(`❌ DB: Erro na transação em ${storeName}:`, transaction.error);
        reject(transaction.error);
      };
    });
  }
}

export const dbService = new DatabaseService();
