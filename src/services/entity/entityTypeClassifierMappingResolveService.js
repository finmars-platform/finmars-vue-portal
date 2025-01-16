import {
	getList as accountClassifierGetList,
	getByKey as accountClassifierGetByKey,
	create as accountClassifierCreate,
	update as accountClassifierUpdate,
	deleteByKey as accountClassifierDeleteByKey
} from '~/services/account/accountClassifierMappingService';
import {
	getList as counterpartyClassifierGetList,
	getByKey as counterpartyClassifierGetByKey,
	create as counterpartyClassifierCreate,
	update as counterpartyClassifierUpdate,
	deleteByKey as counterpartyClassifierDeleteByKey
} from '~/services/counterparty/counterpartyClassifierMappingService';
import {
	getList as responsibleClassifierGetList,
	getByKey as responsibleClassifierGetByKey,
	create as responsibleClassifierCreate,
	update as responsibleClassifierUpdate,
	deleteByKey as responsibleClassifierDeleteByKey
} from '~/services/responsible/responsibleClassifierMappingService';
import {
	getList as portfolioClassifierGetList,
	getByKey as portfolioClassifierGetByKey,
	create as portfolioClassifierCreate,
	update as portfolioClassifierUpdate,
	deleteByKey as portfolioClassifierDeleteByKey
} from '~/services/portfolio/portfolioClassifierMappingService';
import {
	getList as instrumentClassifierGetList,
	getByKey as instrumentClassifierGetByKey,
	create as instrumentClassifierCreate,
	update as instrumentClassifierUpdate,
	deleteByKey as instrumentClassifierDeleteByKey
} from '~/services/instrument/instrumentClassifierMappingService';

export async function getList(entityType, attrTypeId) {
	switch (entityType) {
		case 'account':
			return accountClassifierGetList(attrTypeId);
		case 'counterparty':
			return counterpartyClassifierGetList(attrTypeId);
		case 'responsible':
			return responsibleClassifierGetList(attrTypeId);
		case 'portfolio':
			return portfolioClassifierGetList(attrTypeId);
		case 'instrument':
			return instrumentClassifierGetList(attrTypeId);
	}
}

export async function getByKey(entityType, id) {
	switch (entityType) {
		case 'account':
			return accountClassifierGetByKey(id);
		case 'counterparty':
			return counterpartyClassifierGetByKey(id);
		case 'responsible':
			return responsibleClassifierGetByKey(id);
		case 'portfolio':
			return portfolioClassifierGetByKey(id);
		case 'instrument':
			return instrumentClassifierGetByKey(id);
	}
}

export async function create(entityType, data) {
	switch (entityType) {
		case 'account':
			return accountClassifierCreate(data);
		case 'counterparty':
			return counterpartyClassifierCreate(data);
		case 'responsible':
			return responsibleClassifierCreate(data);
		case 'portfolio':
			return portfolioClassifierCreate(data);
		case 'instrument':
			return instrumentClassifierCreate(data);
	}
}

export async function update(entityType, data) {
	switch (entityType) {
		case 'account':
			return accountClassifierUpdate(data);
		case 'counterparty':
			return counterpartyClassifierUpdate(data);
		case 'responsible':
			return responsibleClassifierUpdate(data);
		case 'portfolio':
			return portfolioClassifierUpdate(data);
		case 'instrument':
			return instrumentClassifierUpdate(data);
	}
}

export async function deleteByKey(entityType, id) {
	switch (entityType) {
		case 'account':
			return accountClassifierDeleteByKey(id);
		case 'counterparty':
			return counterpartyClassifierDeleteByKey(id);
		case 'responsible':
			return responsibleClassifierDeleteByKey(id);
		case 'portfolio':
			return portfolioClassifierDeleteByKey(id);
		case 'instrument':
			return instrumentClassifierDeleteByKey(id);
	}
}
