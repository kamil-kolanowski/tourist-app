const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ["jsx", "js", "ts", "tsx", "cjs", "json"];
config.resolver.assetExts = ["ttf", "png", "jpg"];

// Nie potrzebujemy już żadnych specjalnych modułów
config.resolver.extraNodeModules = {};

module.exports = config;
