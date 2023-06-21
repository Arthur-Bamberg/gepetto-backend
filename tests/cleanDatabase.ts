import { Connector } from "../utils/Connector";

export const cleanDatabase = async () => {
    const connector = new Connector();

    const sqlUpdateSection = `UPDATE section SET FK_idLastMessage = NULL`;
    const sqlMessage = `DELETE FROM message`;
    const sqlUserSection = `DELETE FROM userSection`;
    const sqlSection = `DELETE FROM section`;
    const sqlUser = `DELETE FROM user`;

    await connector.connect();

    await connector.query(sqlUpdateSection);
    await connector.query(sqlMessage);
    await connector.query(sqlUserSection);
    await connector.query(sqlSection);
    await connector.query(sqlUser);

    await connector.disconnect();
}