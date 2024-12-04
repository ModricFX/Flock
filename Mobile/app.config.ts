// app.config.ts
import 'dotenv/config';
import { ExpoConfig, ConfigContext } from '@expo/config';
import {Android, IOS, Splash, Web} from "@expo/config-types";

export default ({ config }: ConfigContext): {
    githubUrl?: string;
    runtimeVersion?: string | { policy: "nativeVersion" | "sdkVersion" | "appVersion" | "fingerprint" };
    scheme?: string | string[];
    plugins?: (string | [] | [string] | [string, any])[];
    android?: Android;
    experiments?: {
        baseUrl?: string;
        supportsTVOnly?: boolean;
        tsconfigPaths?: boolean;
        typedRoutes?: boolean;
        turboModules?: boolean;
        reactCanary?: boolean;
        reactCompiler?: boolean;
        reactServerComponentRoutes?: boolean;
        reactServerFunctions?: boolean
    };
    primaryColor?: string;
    icon?: string;
    androidNavigationBar?: {
        visible?: "leanback" | "immersive" | "sticky-immersive";
        barStyle?: "light-content" | "dark-content";
        backgroundColor?: string
    };
    description?: string;
    androidStatusBar?: {
        barStyle?: "light-content" | "dark-content";
        backgroundColor?: string;
        hidden?: boolean;
        translucent?: boolean
    };
    updates?: {
        enabled?: boolean;
        checkAutomatically?: "ON_ERROR_RECOVERY" | "ON_LOAD" | "WIFI_ONLY" | "NEVER";
        useEmbeddedUpdate?: boolean;
        fallbackToCacheTimeout?: number;
        url?: string;
        codeSigningCertificate?: string;
        codeSigningMetadata?: { alg?: "rsa-v1_5-sha256"; keyid?: string };
        requestHeaders?: { [p: string]: any };
        assetPatternsToBeBundled?: string[]
    };
    ios?: IOS;
    jsEngine?: "hermes" | "jsc";
    originalFullName?: string;
    platforms?: ("android" | "ios" | "web")[];
    notification?: {
        icon?: string;
        color?: string;
        iosDisplayInForeground?: boolean;
        androidMode?: "default" | "collapse";
        androidCollapsedTitle?: string
    };
    developmentClient?: { silentLaunch?: boolean };
    userInterfaceStyle?: "light" | "dark" | "automatic";
    web?: Web;
    extra: { apiEndpoint: string; databaseId: string };
    newArchEnabled?: boolean;
    slug?: string;
    owner?: string;
    assetBundlePatterns?: string[];
    orientation?: "default" | "portrait" | "landscape";
    backgroundColor?: string;
    version?: string;
    locales?: { [p: string]: string | { [p: string]: any } };
    currentFullName?: string;
    name: string;
    _internal?: { pluginHistory?: { [p: string]: any }; [p: string]: any };
    sdkVersion?: string;
    splash?: Splash
} => {
    return {
        ...config,
        name: config.name || 'DefaultAppName', // Ensure name is always a string
        extra: {
            apiEndpoint: process.env.API_ENDPOINT as string,
            databaseId: process.env.DATABASE_ID as string,
        },
    };
};