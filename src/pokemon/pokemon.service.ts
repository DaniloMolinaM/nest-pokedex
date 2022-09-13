import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  //Injeccion de dependencias. 
  constructor(    
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon> 
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    } 
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon; 

    //Si esto es un numero
    if ( !isNaN(+term) ) {
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    // per MongoDI
    if (!pokemon && isValidObjectId (term )){
      pokemon = await this.pokemonModel.findById(term);
    }

    //name
    if (!pokemon){
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }

    if (!pokemon ) throw new NotFoundException(`Pokemon  with id, name or no ${term} not found`);  
    
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    //retorna un pokemon de tipo model, esto significa que es un dato de tipo db. 
    const pokemon = await this.findOne( term);

    if (updatePokemonDto.name) 
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      

    try {
      // el {new: true} es para actualizar el objeto existente actual. 
      await pokemon.updateOne(updatePokemonDto);  
    } catch (error) {
      this.handleExceptions(error);
      
    }  
    
    //exparcier todas las propiedades de un objeto 
    return {...pokemon.toJSON(), ...updatePokemonDto};
  }

  async remove(id: string) {
    //const result = await this.pokemonModel.findByIdAndDelete(id);
    // desestructuro la respuesta de la elimincacion
    
    const { deletedCount } = await this.pokemonModel.deleteOne({_id: id})

    if (deletedCount === 0) 
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    
    return;
  }

  private handleExceptions (error: any ){
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in DB: ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs.`);
  }
}