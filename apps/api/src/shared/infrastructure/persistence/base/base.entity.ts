import { Expose, Transform } from "class-transformer"
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

export abstract class BaseEntity<T> {
  @PrimaryGeneratedColumn({ name: "idx" })
  @Expose()
  idx!: number

  @CreateDateColumn({
    type: "timestamp with time zone",
    name: "created_at",
  })
  @Transform(({ value }) => value?.toISOString()) // ← 추가
  createdAt!: Date

  @UpdateDateColumn({
    type: "timestamp with time zone",
    name: "updated_at",
  })
  @Transform(({ value }) => value?.toISOString()) // ← 추가
  updatedAt!: Date

  // @Index({ unique: true })
  // @Column({ type: "uuid", name: "uuid", generated: "uuid" })
  // @Generated("uuid")
  // @Expose()
  // uuid!: string

  constructor(partial?: Partial<T>) {
    if (partial) {
      Object.assign(this, partial)
    }
  }
}
