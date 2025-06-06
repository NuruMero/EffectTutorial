import { Effect, Layer, ManagedRuntime } from "effect";
import { PokeAPI } from "./services/PokeApi";

// Layers
const MainLayer = Layer.mergeAll(
  PokeAPI.Default
)

const PokemonRuntime = ManagedRuntime.make(MainLayer);

// Lógica del programa
const program = Effect.gen(function* () {
  const pokeAPI = yield* PokeAPI;
  return yield* pokeAPI.getPokemon;
});

// Estableciendo la implementación de la interfaz
const runnable = program.pipe(Effect.provide(MainLayer));

//Error handling
const main = runnable.pipe(
  Effect.catchTags({
    //No hay manejo de config error para forzar configuración buena
    FetchError: () => Effect.succeed("Fetch error"),
    JsonError: () => Effect.succeed("Json error"),
    ParseError: () => Effect.succeed("Parse error"),
  })
);

PokemonRuntime.runPromiseExit(main).then(console.log);