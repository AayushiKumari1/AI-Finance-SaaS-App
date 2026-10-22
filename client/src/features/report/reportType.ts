

// export interface ReportType {
//     _id: string;
//     userId: string;
//     period: string;
//     sentDate: string;
//     status: string;
//     createdAt: string;
//     updatedAt: string;
//     __v: number;
// }

// export interface GetAllReportResponse {
//     message: string;
//     reports: ReportType[];
//     pagination: {
//         pageSize: number;
//         pageNumber: number;
//         totalCount: number;
//         totalPages: number;
//         skip: number;
//     }
// }


// export interface UpdateReportSettingParams {
//     isEnabled: boolean;
// }

export interface ReportType {
    _id: string;
    userId: string;
    period: string;
    sentDate: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface GetAllReportResponse {
    message: string;
    reports: ReportType[];
    pagination: {
        pageSize: number;
        pageNumber: number;
        totalCount: number;
        totalPages: number;
        skip: number;
    }
}

export interface UpdateReportSettingParams {
    isEnabled: boolean;
}

export interface GenerateReportParams {
    from: string;
    to: string;
}

export interface GenerateReportResponse {
    message: string;
    // These are missing when the chosen period has no transactions
    period?: string;
    summary?: {
        income: number;
        expenses: number;
        balance: number;
        savingsRate: number;
        topCategories: {
            name: string;
            amount: number;
            percent: number;
        }[];
    };
    insights?: string[];
}