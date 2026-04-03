export type Warning = {
	id: string;
	latitude: number;
	longitude: number;
	message: string;
	timestamp: number;
};

export type AddWarningInput = {
	latitude: number;
	longitude: number;
	message: string;
};

export type WarningLocationGroup = {
	key: string;
	latitude: number;
	longitude: number;
	totalWarnings: number;
	warnings: Warning[];
};
