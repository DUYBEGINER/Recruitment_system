import {connect} from "../config/db.js";


const getAllUser = async () => {
    let pool = await connect();
    let result = await pool.request().query("SELECT * FROM Employer");
    return result.recordset[0] || null;
};

export { getAllUser };