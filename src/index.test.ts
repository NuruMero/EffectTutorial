import { afterAll, afterEach, beforeAll, expect, it } from "vitest";
import { server } from "../test/node";
import { ConfigProvider, Effect, Layer, ManagedRuntime } from "effect";
import { PokeAPI } from "./services/PokeApi";

// Comportamientos del server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Configuración mockeada
const TestConfigProvider = ConfigProvider.fromMap(
    new Map([["BASE_URL","http://localhost:3000"]])
);
const ConfigProviderLayer = Layer.setConfigProvider(TestConfigProvider);
const MainLayer = PokeAPI.Default.pipe(Layer.provide(ConfigProviderLayer));

const TestingRuntime = ManagedRuntime.make(MainLayer);

// Lógica
const program = Effect.gen(function* () {
  const pokeApi = yield* PokeAPI;
  return yield* pokeApi.getPokemon;
});

// 👇 Provide the `PokeApi` live implementation to test
const main = program.pipe(Effect.provide(MainLayer));

it("returns a valid pokemon", async () => {
  const response = await TestingRuntime.runPromise(main);
  expect(response).toEqual({
    id: 1,
    height: 10,
    weight: 10,
    order: 1,
    name: "myname",
  });
});