export interface MapInfo {
    objectKey: string;
    size: number;
    dateModified: Date;
}

export interface ListAllMapsReport {
    maps: Map<string, MapInfo[]>;
}
