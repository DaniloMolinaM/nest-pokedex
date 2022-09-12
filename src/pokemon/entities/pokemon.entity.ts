import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

// se debe extender de document de mongo para agregar los valores de conexion a la base de datos

@Schema()
export class Pokemon extends Document {


    @Prop({
        unique: true, 
        index: true
    })
    name: string;
    
    @Prop({
        unique: true,
        index: true
    })
    no: number; 
}

export const PokemonSchema = SchemaFactory.createForClass( Pokemon);



