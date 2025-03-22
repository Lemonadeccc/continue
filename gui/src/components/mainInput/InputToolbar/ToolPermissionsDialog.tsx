import { Tool } from "core";
import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { toggleToolGroupSetting } from "../../../redux/slices/uiSlice";
import ToggleSwitch from "../../gui/Switch";
import ToolDropdownItem from "./ToolDropdownItem";

const ToolPermissionsDialog = () => {
  const availableTools = useAppSelector((state) => state.config.config.tools);
  const toolGroupSettings = useAppSelector(
    (store) => store.ui.toolGroupSettings,
  );
  const dispatch = useAppDispatch();

  const toolsByGroup = useMemo(() => {
    const byGroup: Record<string, Tool[]> = {};
    for (const tool of availableTools) {
      if (!byGroup[tool.group]) {
        byGroup[tool.group] = [];
      }
      byGroup[tool.group].push(tool);
    }
    return Object.entries(byGroup);
  }, [availableTools]);

  // Detect duplicate tool names
  const duplicateDetection = useMemo(() => {
    const counts: Record<string, number> = {};
    availableTools.forEach((tool) => {
      if (counts[tool.function.name]) {
        counts[tool.function.name] = counts[tool.function.name] + 1;
      } else {
        counts[tool.function.name] = 1;
      }
    });
    return Object.fromEntries(
      Object.entries(counts).map(([k, v]) => [k, v > 1]),
    );
  }, [availableTools]);

  return (
    <div className="flex max-h-72 flex-col gap-2 divide-y divide-zinc-700 overflow-y-auto pl-1 pr-2">
      {toolsByGroup.map(([groupName, tools]) => (
        <div key={groupName} className="mt-2 flex flex-col">
          <div className="mb-1 flex flex-row items-center justify-between px-1">
            <h3 className="m-0 p-0 text-xs font-bold">{groupName}</h3>
            <ToggleSwitch
              isToggled={toolGroupSettings[groupName] !== "exclude"}
              onToggle={() => dispatch(toggleToolGroupSetting(groupName))}
              text=""
              size={12}
            />
          </div>
          <div className="relative flex flex-col p-1">
            {tools.map((tool) => (
              <ToolDropdownItem
                key={tool.uri + tool.function.name}
                tool={tool}
                duplicatesDetected={duplicateDetection[tool.function.name]}
                excluded={toolGroupSettings[groupName] === "exclude"}
              />
            ))}
            {toolGroupSettings[groupName] === "exclude" && (
              <div className="absolute right-0 top-0 h-full w-full cursor-not-allowed"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToolPermissionsDialog;
