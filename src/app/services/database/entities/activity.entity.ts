import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    name: 'activity',
})
export class Activity {
    @PrimaryGeneratedColumn({
        name: 'id',
    })
    public id?: number;

    @Column({
        name: 'value',
        type: 'varchar',
        length: 128,
        nullable: false,
    })
    public value?: string;
}
