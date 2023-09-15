"use strict";
// noinspection ES6PreferShortImport
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This runs a suite of ./shared tests using an agent configured for local operations,
 * using a SQLite db for storage of credentials, presentations, messages as well as keys and DIDs.
 *
 * This suite also runs a ganache local blockchain to run through some examples of DIDComm using did:ethr identifiers.
 */
var src_1 = require("../packages/core/src");
var src_2 = require("../packages/message-handler/src");
var src_3 = require("../packages/key-manager/src");
var src_4 = require("../packages/did-manager/src");
var src_5 = require("../packages/did-resolver/src");
var src_6 = require("../packages/did-jwt/src");
var src_7 = require("../packages/credential-w3c/src");
var src_8 = require("../packages/credential-eip712/src");
var src_9 = require("../packages/credential-ld/src");
var src_10 = require("../packages/did-provider-ethr/src");
var src_11 = require("../packages/did-provider-web/src");
var src_12 = require("../packages/did-provider-peer/src");
var src_13 = require("../packages/did-provider-key/src");
var src_14 = require("../packages/did-provider-pkh/src");
var src_15 = require("../packages/did-provider-jwk/src");
var src_16 = require("../packages/did-comm/src");
var src_17 = require("../packages/selective-disclosure/src");
var src_18 = require("../packages/kms-local/src");
var src_19 = require("../packages/kms-web3/src");
var src_20 = require("../packages/did-discovery/src");
var src_21 = require("../packages/data-store/src");
var src_22 = require("../packages/test-utils/src");
var typeorm_1 = require("typeorm");
var ganache_provider_1 = require("./utils/ganache-provider");
var ethers_provider_1 = require("./utils/ethers-provider");
var ethr_did_resolver_1 = require("ethr-did-resolver");
var web_did_resolver_1 = require("web-did-resolver");
var credentials_context_1 = require("@transmute/credentials-context");
var fs = require("fs");
var globals_1 = require("@jest/globals");
// Shared tests
var verifiableDataJWT_1 = require("./shared/verifiableDataJWT");
var verifiableDataLD_1 = require("./shared/verifiableDataLD");
var verifiableDataEIP712_1 = require("./shared/verifiableDataEIP712");
var handleSdrMessage_1 = require("./shared/handleSdrMessage");
var resolveDid_1 = require("./shared/resolveDid");
var webDidFlow_1 = require("./shared/webDidFlow");
var saveClaims_1 = require("./shared/saveClaims");
var documentationExamples_1 = require("./shared/documentationExamples");
var keyManager_1 = require("./shared/keyManager");
var didManager_1 = require("./shared/didManager");
var didCommPacking_1 = require("./shared/didCommPacking");
var messageHandler_1 = require("./shared/messageHandler");
var didDiscovery_1 = require("./shared/didDiscovery");
var dbInitOptions_1 = require("./shared/dbInitOptions");
var didCommWithEthrDidFlow_1 = require("./shared/didCommWithEthrDidFlow");
var utils_1 = require("./shared/utils");
var web3_1 = require("./shared/web3");
var credentialStatus_1 = require("./shared/credentialStatus");
var ethrDidFlowSigned_1 = require("./shared/ethrDidFlowSigned");
var didCommWithPeerDidFlow_js_1 = require("./shared/didCommWithPeerDidFlow.js");
globals_1.jest.setTimeout(120000);
var infuraProjectId = '3586660d179141e3801c3895de1c2eba';
var secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c';
var agent;
var dbConnection;
var databaseFile;
var setup = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, provider, registry, ethersProvider;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                databaseFile =
                    ((_b = options === null || options === void 0 ? void 0 : options.context) === null || _b === void 0 ? void 0 : _b.databaseFile) || ':memory:';
                dbConnection = new typeorm_1.DataSource(__assign({ name: ((_c = options === null || options === void 0 ? void 0 : options.context) === null || _c === void 0 ? void 0 : _c['dbName']) || 'test', type: 'sqlite', database: databaseFile, synchronize: false, migrations: src_21.migrations, migrationsRun: true, logging: false, entities: src_21.Entities }, (_d = options === null || options === void 0 ? void 0 : options.context) === null || _d === void 0 ? void 0 : _d.dbConnectionOptions)).initialize();
                return [4 /*yield*/, (0, ganache_provider_1.createGanacheProvider)()];
            case 1:
                _a = _e.sent(), provider = _a.provider, registry = _a.registry;
                ethersProvider = (0, ethers_provider_1.createEthersProvider)();
                agent = (0, src_1.createAgent)(__assign(__assign({}, options), { context: {
                    // authorizedDID: 'did:example:3456'
                    }, plugins: __spreadArray([
                        new src_3.KeyManager({
                            store: new src_21.KeyStore(dbConnection),
                            kms: {
                                local: new src_18.KeyManagementSystem(new src_21.PrivateKeyStore(dbConnection, new src_18.SecretBox(secretKey))),
                                web3: new src_19.Web3KeyManagementSystem({
                                    ethers: ethersProvider,
                                }),
                            },
                        }),
                        new src_4.DIDManager({
                            store: new src_21.DIDStore(dbConnection),
                            defaultProvider: 'did:ethr:ganache',
                            providers: {
                                'did:ethr': new src_10.EthrDIDProvider({
                                    defaultKms: 'local',
                                    ttl: 60 * 60 * 24 * 30 * 12 + 1,
                                    networks: [
                                        {
                                            name: 'mainnet',
                                            chainId: BigInt(1),
                                            rpcUrl: 'https://mainnet.infura.io/v3/' + infuraProjectId,
                                        },
                                        {
                                            name: 'goerli',
                                            chainId: BigInt(5),
                                            rpcUrl: 'https://goerli.infura.io/v3/' + infuraProjectId,
                                        },
                                        {
                                            chainId: BigInt(421613),
                                            name: 'arbitrum:goerli',
                                            rpcUrl: 'https://arbitrum-goerli.infura.io/v3/' + infuraProjectId,
                                            registry: '0x8FFfcD6a85D29E9C33517aaf60b16FE4548f517E',
                                        },
                                        {
                                            chainId: BigInt(1337),
                                            name: 'ganache',
                                            provider: provider,
                                            registry: registry,
                                        },
                                    ],
                                }),
                                'did:web': new src_11.WebDIDProvider({
                                    defaultKms: 'local',
                                }),
                                'did:key': new src_13.KeyDIDProvider({
                                    defaultKms: 'local',
                                }),
                                'did:peer': new src_12.PeerDIDProvider({
                                    defaultKms: 'local'
                                }),
                                'did:pkh': new src_14.PkhDIDProvider({
                                    defaultKms: 'local',
                                }),
                                'did:jwk': new src_15.JwkDIDProvider({
                                    defaultKms: 'local',
                                }),
                                'did:fake': new src_22.FakeDidProvider(),
                            },
                        }),
                        new src_5.DIDResolverPlugin(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (0, ethr_did_resolver_1.getResolver)({
                            infuraProjectId: infuraProjectId,
                            networks: [
                                {
                                    name: 'ganache',
                                    chainId: BigInt(1337),
                                    provider: provider,
                                    registry: registry,
                                },
                            ],
                        })), (0, web_did_resolver_1.getResolver)()), (0, src_13.getDidKeyResolver)()), (0, src_14.getDidPkhResolver)()), (0, src_15.getDidJwkResolver)()), (0, src_12.getResolver)()), new src_22.FakeDidResolver(function () { return agent; }).getDidFakeResolver())),
                        new src_21.DataStore(dbConnection),
                        new src_21.DataStoreORM(dbConnection),
                        new src_2.MessageHandler({
                            messageHandlers: [
                                new src_16.DIDCommMessageHandler(),
                                new src_6.JwtMessageHandler(),
                                new src_7.W3cMessageHandler(),
                                new src_17.SdrMessageHandler(),
                            ],
                        }),
                        new src_16.DIDComm([new src_16.DIDCommHttpTransport()]),
                        new src_7.CredentialPlugin(),
                        new src_8.CredentialIssuerEIP712(),
                        new src_9.CredentialIssuerLD({
                            contextMaps: [src_9.LdDefaultContexts, credentials_context_1.contexts],
                            suites: [new src_9.VeramoEcdsaSecp256k1RecoverySignature2020(), new src_9.VeramoEd25519Signature2018()],
                        }),
                        new src_17.SelectiveDisclosure(),
                        new src_20.DIDDiscovery({
                            providers: [
                                new src_4.AliasDiscoveryProvider(),
                                new src_21.DataStoreDiscoveryProvider(),
                                new src_22.BrokenDiscoveryProvider(),
                            ],
                        })
                    ], ((options === null || options === void 0 ? void 0 : options.plugins) || []), true) }));
                return [2 /*return*/, true];
        }
    });
}); };
var tearDown = function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, dbConnection];
            case 1: return [4 /*yield*/, (_a.sent()).dropDatabase()];
            case 2:
                _a.sent();
                return [4 /*yield*/, dbConnection];
            case 3: return [4 /*yield*/, (_a.sent()).close()];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                e_1 = _a.sent();
                return [3 /*break*/, 6];
            case 6:
                try {
                    fs.unlinkSync(databaseFile);
                }
                catch (e) {
                    // nop
                }
                return [2 /*return*/, true];
        }
    });
}); };
var getAgent = function () { return agent; };
var testContext = { getAgent: getAgent, setup: setup, tearDown: tearDown };
describe('Local integration tests', function () {
    (0, verifiableDataJWT_1.default)(testContext);
    (0, verifiableDataLD_1.default)(testContext);
    (0, verifiableDataEIP712_1.default)(testContext);
    (0, handleSdrMessage_1.default)(testContext);
    (0, resolveDid_1.default)(testContext);
    (0, webDidFlow_1.default)(testContext);
    (0, saveClaims_1.default)(testContext);
    (0, documentationExamples_1.default)(testContext);
    (0, keyManager_1.default)(testContext);
    (0, didManager_1.default)(testContext);
    (0, messageHandler_1.default)(testContext);
    (0, didCommPacking_1.default)(testContext);
    (0, didDiscovery_1.default)(testContext);
    (0, dbInitOptions_1.default)(testContext);
    (0, utils_1.default)(testContext);
    (0, web3_1.default)(testContext);
    (0, didCommWithEthrDidFlow_1.default)(testContext);
    (0, didCommWithPeerDidFlow_js_1.default)(testContext);
    (0, credentialStatus_1.default)(testContext);
    (0, ethrDidFlowSigned_1.default)(testContext);
});
