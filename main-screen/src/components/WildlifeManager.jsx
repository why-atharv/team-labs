import React from 'react';
import { WildlifeEntity } from './WildlifeEntity.jsx';

export function WildlifeManager({ animalList = [], pokemonList = [] }) {
  const list = animalList.length > 0 ? animalList : pokemonList;

  return (
    <group>
      {list.map((animal) => (
        <WildlifeEntity key={animal.id} animal={animal} />
      ))}
    </group>
  );
}

// Backward compatibility alias
export const PokemonManager = WildlifeManager;
