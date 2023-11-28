/**
 * Created by szhitenev on 03.04.2017.
 */

var getAttributes = function () {
    return [
        {
            key: 'net_position_return',
            name: 'Net position return',
            value_type: 20,
        },
        {
            key: 'net_position_return_loc',
            name: 'Net position return (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'position_return',
            name: 'Position return',
            value_type: 20,
        },
        {
            key: 'position_return_loc',
            name: 'Position return (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'daily_price_change',
            name: 'Daily price change',
            value_type: 20,
        },
        {
            key: 'mtd_price_change',
            name: 'MTD price change',
            value_type: 20,
        },
        {
            key: 'principal_fx',
            name: 'Principal FX',
            value_type: 20,
        },
        {
            key: 'principal_fx_loc',
            name: 'Principal FX (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'principal_fixed',
            name: 'Principal fixed',
            value_type: 20,
        },
        {
            key: 'principal_fixed_loc',
            name: 'Principal fixed (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'carry_fx',
            name: 'Carry FX',
            value_type: 20,
        },
        {
            key: 'carry_fx_loc',
            name: 'Carry FX (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'carry_fixed',
            name: 'Carry fixed',
            value_type: 20,
        },
        {
            key: 'carry_fixed_loc',
            name: 'Carry fixed (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'overheads_fx',
            name: 'Overheads FX',
            value_type: 20,
        },
        {
            key: 'overheads_fx_loc',
            name: 'Overheads FX (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'overheads_fixed',
            name: 'Overheads fixed',
            value_type: 20,
        },
        {
            key: 'overheads_fixed_loc',
            name: 'Overheads fixed (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'principal',
            name: 'Principal',
            value_type: 20,
        },
        {
            key: 'carry',
            name: 'Carry',
            value_type: 20,
        },
        {
            key: 'overheads',
            name: 'Overheads',
            value_type: 20,
        },
        {
            key: 'total',
            name: 'Total',
            value_type: 20,
        },
        {
            key: 'principal_loc',
            name: 'Pricnipal (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'carry_loc',
            name: 'Carry (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'overheads_loc',
            name: 'Overheads (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'total_loc',
            name: 'Total (Pricing Currency)',
            value_type: 20,
        },
        {
            key: 'total_fx',
            name: 'Total FX',
            value_type: 20,
        },
        {
            key: 'total_fx_loc',
            name: 'Total FX (Pricing Currency)',
            value_type: 20,
        },

        {
            key: 'total_fixed',
            name: 'Total fixed',
            value_type: 20,
        },
        {
            key: 'total_fixed_loc',
            name: 'Total fixed (Pricing Currency)',
            value_type: 20,
        },
    ]
}

export default {
    getAttributes: getAttributes,
}
