import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

export abstract class BaseEntity<T> {
  @PrimaryGeneratedColumn()
  id!: number

  @CreateDateColumn({
    type: "timestamp with time zone",
    name: "created_at",
  })
  createdAt!: Date

  @UpdateDateColumn({
    type: "timestamp with time zone",
    name: "updated_at",
  })
  updatedAt!: Date

  constructor(partial?: Partial<T>) {
    if (partial) {
      Object.assign(this, partial)
    }
  }
}
