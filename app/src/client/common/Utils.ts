export function sleep(ms: number, id?: string) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}