export class JobService {
  async list() {
    return [];
  }
  
  async create(data: any) {
    return { id: 'job-' + Date.now(), ...data };
  }
  
  async update(id: string, data: any) {
    return { id, ...data };
  }
  
  async delete(id: string) {
    return { id };
  }
  
  async getStatus(id: string) {
    return { id, status: 'pending' };
  }
}
