
export function convertToCents( amount : number ){
    
    return Math.round( amount * 100 )
}

export function convertToDollarUnit( amount : number ){

    return amount / 100
}

export function formatCurrency( amount: number ){

    return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    }).format(amount);
}