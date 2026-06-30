import { useNavigate } from "react-router-dom";
import { useCompare } from "../context/CompareContext";

const CompareBar = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  return (
    <div className="tn-compare-bar">
      <div className="pills">
        {compareList.map((item) => (
          <span key={item._id} className="pill">
            {item.name.length > 16 ? `${item.name.slice(0, 16)}…` : item.name}{" "}
            <span
              style={{ cursor: "pointer", opacity: 0.6 }}
              onClick={() => removeFromCompare(item._id)}
            >
              ✕
            </span>
          </span>
        ))}
      </div>
      <button className="clear" onClick={clearCompare}>Clear</button>
      <button
        className="go"
        onClick={() => navigate("/compare")}
        disabled={compareList.length < 2}
        style={compareList.length < 2 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
      >
        Compare ({compareList.length})
      </button>
    </div>
  );
};

export default CompareBar;