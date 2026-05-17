import { Repository, SelectQueryBuilder, DeepPartial, ObjectLiteral } from 'typeorm';

/**
 * Abstract base repository class that wraps TypeORM Repository
 * Provides common query patterns and helper methods for all repositories
 */
export abstract class BaseRepository<Entity extends ObjectLiteral> {
  protected repository: Repository<Entity>;

  /**
   * Create a query builder with the default alias
   * @returns Query builder instance
   */
  protected createQB(alias: string): SelectQueryBuilder<Entity> {
    return this.repository.createQueryBuilder(alias);
  }

  /**
   * Find entity by ID
   * @param id Entity ID
   * @returns Entity or null
   */
  async findById(id: string | number): Promise<Entity | null> {
    return this.repository.findOne({
      where: { id } as any,
    });
  }

  /**
   * Create entity (returns unsaved instance)
   * @param data Partial entity data
   * @returns Entity instance
   */
  createInstance(data: DeepPartial<Entity>): Entity {
    return this.repository.create(data);
  }

  /**
   * Create and save entity
   * @param data Partial entity data
   * @returns Saved entity
   */
  async createAndSave(data: DeepPartial<Entity>): Promise<Entity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  /**
   * Save entity
   * @param entity Entity to save
   * @returns Saved entity
   */
  async save(entity: Entity): Promise<Entity> {
    return this.repository.save(entity);
  }

  /**
   * Update entity by ID
   * @param id Entity ID
   * @param data Partial entity data
   * @returns Updated entity
   */
  async updateById(id: string | number, data: DeepPartial<Entity>): Promise<Entity | null> {
    await this.repository.update(id as any, data as any);
    return this.findById(id);
  }

  /**
   * Delete entity by ID
   * @param id Entity ID
   * @returns Number of affected rows
   */
  async deleteById(id: string | number): Promise<number> {
    const result = await this.repository.delete(id as any);
    return result.affected || 0;
  }

  /**
   * Count all entities
   * @returns Count
   */
  async countAll(): Promise<number> {
    return this.repository.count();
  }

  /**
   * Check if entity exists by ID
   * @param id Entity ID
   * @returns Boolean
   */
  async existsById(id: string | number): Promise<boolean> {
    const count = await this.repository.countBy({ id } as any);
    return count > 0;
  }
}
