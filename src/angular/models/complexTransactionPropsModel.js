/**
 * Created by szhitenev on 03.04.2017.
 */

var getAttributes = function () {
    return [
        {
            key: 'code',
            name: 'Code',
            value_type: 20,
        },
        {
            key: 'date',
            name: 'Date',
            value_type: 40,
        },
        {
            key: 'status',
            name: 'Status',
            value_type: 'field',
            value_entity: 'complex-transaction-status',
            code: 'user_code',
            value_content_type: 'transactions.complextransactionstatus',
            allow_null: false,
        },
        {
            key: 'is_locked',
            name: 'Is locked',
            value_type: 50,
        },
        {
            key: 'is_canceled',
            name: 'Is canceled',
            value_type: 50,
        },
        {
            key: 'transaction_unique_code',
            name: 'Transaction Unique Code',
            value_type: 10,
        },
        {
            key: 'text',
            name: 'Description',
            value_type: 10,
        },
        // {
        //     "key": "source",
        //     "name": "Source",
        //     "value_type": 10
        // },
        {
            key: 'transaction_type',
            name: 'Transaction Type',
            value_type: 'field',
            value_entity: 'transaction-type',
            code: 'user_code',
            value_content_type: 'transactions.transactiontype',
            allow_null: false,
        },

        {
            key: 'user_text_1',
            name: 'User Text 1',
            value_type: 10,
        },
        {
            key: 'user_text_2',
            name: 'User Text 2',
            value_type: 10,
        },

        {
            key: 'user_text_3',
            name: 'User Text 3',
            value_type: 10,
        },

        {
            key: 'user_text_4',
            name: 'User Text 4',
            value_type: 10,
        },

        {
            key: 'user_text_5',
            name: 'User Text 5',
            value_type: 10,
        },

        {
            key: 'user_text_6',
            name: 'User Text 6',
            value_type: 10,
        },

        {
            key: 'user_text_7',
            name: 'User Text 7',
            value_type: 10,
        },

        {
            key: 'user_text_8',
            name: 'User Text 8',
            value_type: 10,
        },

        {
            key: 'user_text_9',
            name: 'User Text 9',
            value_type: 10,
        },

        {
            key: 'user_text_10',
            name: 'User Text 10',
            value_type: 10,
        },

        {
            key: 'user_text_11',
            name: 'User Text 11',
            value_type: 10,
        },
        {
            key: 'user_text_12',
            name: 'User Text 12',
            value_type: 10,
        },

        {
            key: 'user_text_13',
            name: 'User Text 13',
            value_type: 10,
        },

        {
            key: 'user_text_14',
            name: 'User Text 14',
            value_type: 10,
        },

        {
            key: 'user_text_15',
            name: 'User Text 15',
            value_type: 10,
        },

        {
            key: 'user_text_16',
            name: 'User Text 16',
            value_type: 10,
        },

        {
            key: 'user_text_17',
            name: 'User Text 17',
            value_type: 10,
        },

        {
            key: 'user_text_18',
            name: 'User Text 18',
            value_type: 10,
        },

        {
            key: 'user_text_19',
            name: 'User Text 19',
            value_type: 10,
        },

        {
            key: 'user_text_20',
            name: 'User Text 20',
            value_type: 10,
        },

        {
            key: 'user_text_21',
            name: 'User Text 21',
            value_type: 10,
        },
        {
            key: 'user_text_22',
            name: 'User Text 22',
            value_type: 10,
        },

        {
            key: 'user_text_23',
            name: 'User Text 23',
            value_type: 10,
        },

        {
            key: 'user_text_24',
            name: 'User Text 24',
            value_type: 10,
        },

        {
            key: 'user_text_25',
            name: 'User Text 25',
            value_type: 10,
        },

        {
            key: 'user_text_26',
            name: 'User Text 26',
            value_type: 10,
        },

        {
            key: 'user_text_27',
            name: 'User Text 27',
            value_type: 10,
        },

        {
            key: 'user_text_28',
            name: 'User Text 28',
            value_type: 10,
        },

        {
            key: 'user_text_29',
            name: 'User Text 29',
            value_type: 10,
        },

        {
            key: 'user_text_30',
            name: 'User Text 30',
            value_type: 10,
        },

        {
            key: 'user_number_1',
            name: 'User Number 1',
            value_type: 20,
        },
        {
            key: 'user_number_2',
            name: 'User Number 2',
            value_type: 20,
        },

        {
            key: 'user_number_3',
            name: 'User Number 3',
            value_type: 20,
        },

        {
            key: 'user_number_4',
            name: 'User Number 4',
            value_type: 20,
        },

        {
            key: 'user_number_5',
            name: 'User Number 5',
            value_type: 20,
        },

        {
            key: 'user_number_6',
            name: 'User Number 6',
            value_type: 20,
        },

        {
            key: 'user_number_7',
            name: 'User Number 7',
            value_type: 20,
        },

        {
            key: 'user_number_8',
            name: 'User Number 8',
            value_type: 20,
        },

        {
            key: 'user_number_9',
            name: 'User Number 9',
            value_type: 20,
        },

        {
            key: 'user_number_10',
            name: 'User Number 10',
            value_type: 20,
        },
        {
            key: 'user_number_11',
            name: 'User Number 11',
            value_type: 20,
        },
        {
            key: 'user_number_12',
            name: 'User Number 12',
            value_type: 20,
        },

        {
            key: 'user_number_13',
            name: 'User Number 13',
            value_type: 20,
        },

        {
            key: 'user_number_14',
            name: 'User Number 14',
            value_type: 20,
        },

        {
            key: 'user_number_15',
            name: 'User Number 15',
            value_type: 20,
        },

        {
            key: 'user_number_16',
            name: 'User Number 16',
            value_type: 20,
        },

        {
            key: 'user_number_17',
            name: 'User Number 17',
            value_type: 20,
        },

        {
            key: 'user_number_18',
            name: 'User Number 18',
            value_type: 20,
        },

        {
            key: 'user_number_19',
            name: 'User Number 19',
            value_type: 20,
        },

        {
            key: 'user_number_20',
            name: 'User Number 20',
            value_type: 20,
        },

        {
            key: 'user_date_1',
            name: 'User Date 1',
            value_type: 40,
        },
        {
            key: 'user_date_2',
            name: 'User Date 2',
            value_type: 40,
        },
        {
            key: 'user_date_3',
            name: 'User Date 3',
            value_type: 40,
        },
        {
            key: 'user_date_4',
            name: 'User Date 4',
            value_type: 40,
        },
        {
            key: 'user_date_5',
            name: 'User Date 5',
            value_type: 40,
        },
    ]
}

export default {
    getAttributes: getAttributes,
}
