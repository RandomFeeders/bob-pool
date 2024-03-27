import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    name: 'user',
})
export class User {
    @PrimaryGeneratedColumn({
        name: 'id',
    })
    public id?: number;

    @Column({
        type: 'varchar',
        length: 24,
        nullable: false,
    })
    public discordId?: string;
}
