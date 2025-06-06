import { Context, Effect, Layer, ParseResult, Schema } from "effect";
import { Pokemon, decodePokemon } from "../domain/schemas";
import { FetchError, JsonError } from "../domain/errors";
import type { ConfigError } from "effect/ConfigError";
import { PokemonCollection } from "./PokemonCollection";
import { BuildPokeApiUrl } from "./BuildPokeApiUrl";

// Define la interfaz del servicio
export interface PokeAPIImpl {
  readonly getPokemon: Effect.Effect<
    Pokemon,
    FetchError | JsonError | ParseResult.ParseError | ConfigError
  >;
}

// Implementación del servicio
const make = Effect.gen(function* () {
  const pokemonCollection = yield* PokemonCollection;
  const buildPokeApiUrl = yield* BuildPokeApiUrl;

  return {
    getPokemon: Effect.gen(function* () {
      const requestUrl = buildPokeApiUrl({ name: pokemonCollection[0] });

      const response = yield* Effect.tryPromise({
        try: () => fetch(`${requestUrl}`),
        catch: () => new FetchError(),
      });

      if (!response.ok) {
        return yield* new FetchError();
      }

      const json = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: () => new JsonError(),
      });

      return yield* decodePokemon(json);
    })
  };
});

// Definición del servicio
export class PokeAPI extends Effect.Service<PokeAPI>()("PokeAPI", {
  effect: Effect.gen(function* () {
    const pokemonCollection = yield* PokemonCollection;
    const buildPokeApiUrl = yield* BuildPokeApiUrl;

    return {
      getPokemon: Effect.gen(function* () {
        const requestUrl = buildPokeApiUrl({ name: pokemonCollection[0] });

        const response = yield* Effect.tryPromise({
          try: () => fetch(requestUrl),
          catch: () => new FetchError(),
        });

        if (!response.ok) {
          return yield* new FetchError();
        }

        const json = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: () => new JsonError(),
        });

        return yield* Schema.decodeUnknown(Pokemon)(json);
      }),
    };
  }),
  dependencies: [PokemonCollection.Default, BuildPokeApiUrl.Default]
}) {}
