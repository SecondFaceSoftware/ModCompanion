import { Path } from "./SharedPaths.js";

export interface MapInfo {
    objectKey: string;
    size: number;
    dateModified: Date;
}

export interface ListAllMapsReport {
    maps: Map<Path, MapInfo[]>;
}
