"use strict";

// The site config and the hardware catalogue, read once at start. Paths in the
// app's mdk.yaml config resolve against the directory `mdk run` runs in (the
// project root).

const fs = require("fs");
const path = require("path");

const DEFAULT_HISTORY_DAYS = 400;

function readJson(file, label) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch (err) {
    throw new Error(`ERR_CONFIG_MISSING: ${label} (${file}): ${err.message}`, { cause: err });
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`ERR_CONFIG_INVALID: ${label} (${file}) is not valid JSON: ${err.message}`, {
      cause: err,
    });
  }
}

function fail(reason) {
  throw new Error(`ERR_CONFIG_INVALID: ${reason}`);
}

const isString = (v) => typeof v === "string" && v.trim() !== "";
const stringList = (v) => Array.isArray(v) && v.every(isString);

function validTimezone(tz) {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function parseSite(raw) {
  if (!raw || typeof raw !== "object") fail("site config must be an object");
  const site = raw.site || {};
  if (!isString(site.name)) fail("site.name is required");
  const timezone = site.timezone || "UTC";
  if (!validTimezone(timezone)) fail(`site.timezone "${timezone}" is not a known IANA timezone`);

  if (!Array.isArray(raw.miningUnits) || raw.miningUnits.length === 0)
    fail("miningUnits must list at least one mining unit");
  const ids = new Set();
  const miningUnits = raw.miningUnits.map((u, i) => {
    if (!isString(u.id)) fail(`miningUnits[${i}].id is required`);
    if (ids.has(u.id)) fail(`miningUnits[${i}].id "${u.id}" is used twice`);
    ids.add(u.id);
    if (u.workers !== undefined && !stringList(u.workers))
      fail(`miningUnits[${i}].workers must be a list of worker names`);
    if (u.devices !== undefined && !stringList(u.devices))
      fail(`miningUnits[${i}].devices must be a list of device ids`);
    if (!u.workers && !u.devices) fail(`miningUnits[${i}] needs workers or devices`);
    return {
      id: u.id,
      name: isString(u.name) ? u.name : u.id,
      workers: u.workers || [],
      devices: u.devices || [],
      // Model for devices that do not report one.
      model: isString(u.model) ? u.model : null,
    };
  });

  const meters = (raw.meters || []).map((m, i) => {
    if (!isString(m.device)) fail(`meters[${i}].device is required`);
    return {
      device: m.device,
      label: isString(m.label) ? m.label : m.device,
      siteMeter: m.siteMeter === true,
    };
  });
  if (meters.filter((m) => m.siteMeter).length > 1) fail("only one meter can be the site meter");

  const device = (block, label) => {
    if (block === undefined || block === null) return null;
    if (!isString(block.device)) fail(`${label}.device is required`);
    return { device: block.device };
  };

  return {
    site: { name: site.name, timezone },
    miningUnits,
    meters,
    pool: device(raw.pool, "pool"),
    market: device(raw.market, "market"),
  };
}

function parseCatalogue(raw) {
  if (!raw || !Array.isArray(raw.models)) fail("hardware catalogue must have a models list");
  const models = new Map();
  raw.models.forEach((m, i) => {
    if (!isString(m.id)) fail(`models[${i}].id is required`);
    if (!(m.nominalHashrateThs > 0))
      fail(`models[${i}].nominalHashrateThs must be a positive number`);
    if (!(m.nominalPowerW > 0)) fail(`models[${i}].nominalPowerW must be a positive number`);
    const model = {
      id: m.id,
      vendor: m.vendor || null,
      model: m.model || m.id,
      displayName: m.displayName || m.model || m.id,
      nominalHashrateThs: m.nominalHashrateThs,
      nominalPowerW: m.nominalPowerW,
    };
    // Workers report models in their own spelling; aliases map them here.
    for (const key of [m.id, ...(Array.isArray(m.aliases) ? m.aliases : [])])
      models.set(String(key).toLowerCase(), model);
  });
  return {
    models,
    find: (key) => (key ? models.get(String(key).toLowerCase()) || null : null),
  };
}

/** The app's resolved configuration from its mdk.yaml `config` block. */
function loadConfig(appConfig, cwd = process.cwd()) {
  const resolve = (p) => path.resolve(cwd, p);
  if (!isString(appConfig.siteConfig))
    fail("the app config needs siteConfig (path to the site config file)");
  if (!isString(appConfig.catalogue))
    fail("the app config needs catalogue (path to the hardware catalogue file)");

  const historyDays =
    Number(appConfig.historyDays) > 0 ? Number(appConfig.historyDays) : DEFAULT_HISTORY_DAYS;
  const sampleIntervalSec =
    Number(appConfig.sampleIntervalSec) >= 10 ? Number(appConfig.sampleIntervalSec) : 300;

  return {
    ...parseSite(readJson(resolve(appConfig.siteConfig), "site config")),
    catalogue: parseCatalogue(readJson(resolve(appConfig.catalogue), "hardware catalogue")),
    historyDays,
    sampleIntervalSec,
    seed: isString(appConfig.seed) ? resolve(appConfig.seed) : null,
  };
}

module.exports = { loadConfig, parseSite, parseCatalogue };
