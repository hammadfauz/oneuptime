import Model, {
    requiredFields,
    uniqueFields,
    slugifyField,
} from '../Models/ApplicationScanner';
import DatabaseService from './DatabaseService';
import UUID from 'Common/Utils/UUID';
import CreateBy from '../Types/DB/CreateBy';
import Document from '../Infrastructure/ORM';
import OneUptimeDate from 'Common/Types/Date';

export default class SslService extends DatabaseService<typeof Model> {
    constructor() {
        super({
            model: Model,
            requiredFields: requiredFields,
            uniqueFields: uniqueFields,
            friendlyName: 'Application Scanner',
            publicListProps: {
                populate: [],
                select: [],
            },
            adminListProps: {
                populate: [],
                select: [],
            },
            ownerListProps: {
                populate: [],
                select: [],
            },
            memberListProps: {
                populate: [],
                select: [],
            },
            viewerListProps: {
                populate: [],
                select: [],
            },
            publicItemProps: {
                populate: [],
                select: [],
            },
            adminItemProps: {
                populate: [],
                select: [],
            },
            memberItemProps: {
                populate: [],
                select: [],
            },
            viewerItemProps: {
                populate: [],
                select: [],
            },
            ownerItemProps: {
                populate: [],
                select: [],
            },
            isResourceByProject: true,
            slugifyField: slugifyField,
        });
    }

    protected override async onBeforeCreate({
        data,
    }: CreateBy): Promise<CreateBy> {
        let applicationScannerKey;
        if (data.get('applicationScannerKey')) {
            applicationScannerKey = data.get('applicationScannerKey');
        } else {
            applicationScannerKey = UUID.generate();
        }

        data.set('applicationScannerKey', applicationScannerKey);

        return Promise.resolve({ data } as CreateBy);
    }

    async updateStatus(applicationScannerId: string) {
        const data = new Document<typeof Model>();
        data.set('lastAlive', OneUptimeDate.getCurrentDate());

        await this.updateOneBy({ query: { _id: applicationScannerId }, data });
    }
}
