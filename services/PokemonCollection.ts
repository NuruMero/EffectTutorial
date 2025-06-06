import { Array, Context, Effect, Layer } from "effect";

export class PokemonCollection extends Effect.Service<PokemonCollection>()(
    "PokemonCollection",
    {
        succeed: ["staryu", "perrserker", "flaaffy"],
    }
) {}