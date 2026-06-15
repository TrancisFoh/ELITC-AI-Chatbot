import os

file_path = "NewSystem/Views/Admin/UserManager.razor"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the table user display (optional, but it's already using FullName if available)
content = content.replace(
    """<div class="font-bold text-zinc-900 text-base">@(string.IsNullOrWhiteSpace(user.User.FullName) ? user.User.UserName : user.User.FullName)</div>""",
    """<div class="font-bold text-zinc-900 text-base">@(string.IsNullOrWhiteSpace(user.User.FullName) ? "Unnamed User" : user.User.FullName)</div>"""
)

# 2. Update the actions buttons in the table
old_actions = """                                        @if (user.IsLockedOut)
                                        {
                                            <button @onclick="() => UnlockUser(user.User)"
                                                class="p-2 text-zinc-400 hover:text-emerald-600 bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-200 rounded-lg transition-all"
                                                title="Unlock User">
                                                <i data-lucide="unlock" class="w-4 h-4"></i>
                                            </button>
                                        }
                                        <button @onclick="() => ConfirmDelete(user.User)"
                                            class="p-2 text-zinc-400 hover:text-rose-500 bg-white hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 rounded-lg transition-all"
                                            title="Delete User">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>"""

new_actions = """                                        @if (user.Roles.Contains("Moderator"))
                                        {
                                            <button @onclick="() => OpenPermissionsModal(user.User)"
                                                class="p-2 text-zinc-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-zinc-200 hover:border-indigo-200 rounded-lg transition-all"
                                                title="Moderator Permissions">
                                                <i data-lucide="shield" class="w-4 h-4"></i>
                                            </button>
                                        }
                                        @if (user.IsLockedOut)
                                        {
                                            <button @onclick="() => UnlockUser(user.User)"
                                                class="p-2 text-zinc-400 hover:text-emerald-600 bg-white hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-200 rounded-lg transition-all"
                                                title="Unlock User">
                                                <i data-lucide="unlock" class="w-4 h-4"></i>
                                            </button>
                                        }
                                        <button @onclick="() => OpenEditModal(user.User, user.Roles)"
                                            class="p-2 text-zinc-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-zinc-200 hover:border-blue-200 rounded-lg transition-all"
                                            title="Edit User">
                                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                                        </button>
                                        <button @onclick="() => ConfirmDelete(user.User)"
                                            class="p-2 text-zinc-400 hover:text-rose-500 bg-white hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 rounded-lg transition-all"
                                            title="Delete User">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>"""
content = content.replace(old_actions, new_actions)

# 3. Remove the global permissions block (between the table card and the add user modal)
global_permissions_block_start = """    <div class="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <i data-lucide="shield" class="w-5 h-5"></i>
                </div>
                <div>
                    <h3 class="font-bold text-zinc-900 text-lg">Moderator Permissions</h3>
                    <p class="text-xs text-zinc-500 font-medium">Select which tabs Moderators can access.</p>
                </div>
            </div>
            <button @onclick="SaveModeratorTabs" disabled="@isSavingTabs" class="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50">
                <i data-lucide="save" class="w-4 h-4"></i> @(isSavingTabs ? "Saving..." : "Save Permissions")
            </button>
        </div>"""

global_permissions_block_end = """        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            @foreach (var tab in availableTabs)
            {
                <label class="flex items-center gap-3 p-3 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                    <input type="checkbox" checked="@moderatorTabs.Contains(tab.Key)" @onchange="@(e => ToggleTab(tab.Key, (bool)(e.Value ?? false)))" class="w-4 h-4 text-elitc-gold rounded border-zinc-300 focus:ring-elitc-gold" />
                    <span class="text-sm font-medium text-zinc-700">@tab.Value</span>
                </label>
            }
        </div>
    </div>"""

import re
# Regex to match the entire global permissions block and remove it
content = re.sub(r'    <div class="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">\s*<div class="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">[\s\S]*?<div class="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">[\s\S]*?</div>\s*</div>', '', content)


# 4. Insert Modals
modals_insert_point = """@if (userToDelete != null)"""
new_modals = """@if (userToEdit != null)
{
    <div class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @onclick="() => userToEdit = null"></div>
        <div class="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div class="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h2 class="text-xl font-bold text-zinc-900">Edit User</h2>
                <button @onclick="() => userToEdit = null"
                    class="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <div class="p-6 space-y-4">
                @if (!string.IsNullOrEmpty(errorMessage))
                {
                    <div class="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i> @errorMessage
                    </div>
                }

                <div class="space-y-1">
                    <label class="text-sm font-semibold text-zinc-700">Full Name</label>
                    <input type="text" @bind="editUserFullName"
                        class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-elitc-gold/20 outline-none text-sm"
                        placeholder="John Doe" />
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-semibold text-zinc-700">Role</label>
                    <select @bind="editUserRole" class="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-elitc-gold/20 outline-none text-sm">
                        <option value="Admin">Admin</option>
                        <option value="Moderator">Moderator</option>
                    </select>
                </div>
            </div>

            <div class="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
                <button @onclick="() => userToEdit = null"
                    class="px-6 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">Cancel</button>
                <button @onclick="SaveEditUser" disabled="@isSaving"
                    class="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-zinc-900/20 transition-all disabled:opacity-50">
                    @(isSaving ? "Saving..." : "Save Changes")
                </button>
            </div>
        </div>
    </div>
}

@if (userToManagePermissions != null)
{
    <div class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @onclick="() => userToManagePermissions = null"></div>
        <div class="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div class="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <i data-lucide="shield" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-zinc-900 text-lg">Moderator Permissions</h3>
                        <p class="text-xs text-zinc-500 font-medium">@userToManagePermissions.Email</p>
                    </div>
                </div>
                <button @onclick="() => userToManagePermissions = null"
                    class="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            @if (showTabsSavedMsg)
            {
                <div class="m-6 mb-0 p-3 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-lg flex items-center gap-2">
                    <i data-lucide="check-circle" class="w-4 h-4"></i> Permissions saved successfully!
                </div>
            }

            <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                @foreach (var tab in availableTabs)
                {
                    <label class="flex items-center gap-3 p-3 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                        <input type="checkbox" checked="@moderatorTabs.Contains(tab.Key)" @onchange="@(e => ToggleTab(tab.Key, (bool)(e.Value ?? false)))" class="w-4 h-4 text-elitc-gold rounded border-zinc-300 focus:ring-elitc-gold" />
                        <span class="text-sm font-medium text-zinc-700">@tab.Value</span>
                    </label>
                }
            </div>
            
            <div class="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
                <button @onclick="() => userToManagePermissions = null"
                    class="px-6 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">Close</button>
                <button @onclick="SaveModeratorTabs" disabled="@isSavingTabs" class="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-zinc-900/20 flex items-center gap-2 transition-all disabled:opacity-50">
                    <i data-lucide="save" class="w-4 h-4"></i> @(isSavingTabs ? "Saving..." : "Save Permissions")
                </button>
            </div>
        </div>
    </div>
}

@if (userToDelete != null)"""
content = content.replace(modals_insert_point, new_modals)

# 5. Update C# Code

old_code = """    private ApplicationUser? userToDelete;
    
    private bool isSavingTabs = false;
    private bool showTabsSavedMsg = false;
    private List<string> moderatorTabs = new();"""

new_code = """    private ApplicationUser? userToDelete;
    private ApplicationUser? userToEdit;
    private ApplicationUser? userToManagePermissions;
    
    private string editUserFullName = "";
    private string editUserRole = "Admin";
    private string originalEditUserRole = "";
    
    private bool isSavingTabs = false;
    private bool showTabsSavedMsg = false;
    private List<string> moderatorTabs = new();"""
content = content.replace(old_code, new_code)


old_load_config = """        var configStr = await DbService.GetConfigValueAsync("MODERATOR_ALLOWED_TABS", "");
        if (!string.IsNullOrWhiteSpace(configStr))
        {
            moderatorTabs = configStr.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
        }"""
content = content.replace(old_load_config, "")

# We need to add the methods to C# block. We'll find `private async Task SaveModeratorTabs()` and replace it.

old_methods = """    private void ToggleTab(string tabKey, bool isChecked)
    {
        if (isChecked && !moderatorTabs.Contains(tabKey))
        {
            moderatorTabs.Add(tabKey);
        }
        else if (!isChecked)
        {
            moderatorTabs.Remove(tabKey);
        }
    }

    private async Task SaveModeratorTabs()
    {
        isSavingTabs = true;
        var tabsString = string.Join(",", moderatorTabs);
        await DbService.SaveConfigAsync(new ELITC_AI_Chatbot.Models.Config { Id = "mod-tabs-config", Key = "MODERATOR_ALLOWED_TABS", Value = tabsString });
        isSavingTabs = false;
        showTabsSavedMsg = true;
        await Task.Delay(3000);
        showTabsSavedMsg = false;
        StateHasChanged();
    }"""


new_methods = """    private void OpenEditModal(ApplicationUser user, IList<string> roles)
    {
        userToEdit = user;
        editUserFullName = user.FullName ?? "";
        originalEditUserRole = roles.FirstOrDefault() ?? "Admin";
        editUserRole = originalEditUserRole;
        errorMessage = "";
    }

    private async Task SaveEditUser()
    {
        if (userToEdit == null) return;
        isSaving = true;
        
        userToEdit.FullName = editUserFullName;
        var result = await AppUserManager.UpdateAsync(userToEdit);
        
        if (result.Succeeded)
        {
            if (editUserRole != originalEditUserRole)
            {
                await AppUserManager.RemoveFromRoleAsync(userToEdit, originalEditUserRole);
                await AppUserManager.AddToRoleAsync(userToEdit, editUserRole);
            }
            userToEdit = null;
            successMessage = "User updated successfully.";
            await LoadUsers();
        }
        else
        {
            errorMessage = string.Join(" ", result.Errors.Select(e => e.Description));
        }
        isSaving = false;
        StateHasChanged();
    }

    private async Task OpenPermissionsModal(ApplicationUser user)
    {
        userToManagePermissions = user;
        moderatorTabs.Clear();
        var claims = await AppUserManager.GetClaimsAsync(user);
        var tabsClaim = claims.FirstOrDefault(c => c.Type == "AllowedTabs");
        if (tabsClaim != null && !string.IsNullOrWhiteSpace(tabsClaim.Value))
        {
            moderatorTabs = tabsClaim.Value.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
        }
    }

    private void ToggleTab(string tabKey, bool isChecked)
    {
        if (isChecked && !moderatorTabs.Contains(tabKey))
        {
            moderatorTabs.Add(tabKey);
        }
        else if (!isChecked)
        {
            moderatorTabs.Remove(tabKey);
        }
    }

    private async Task SaveModeratorTabs()
    {
        if (userToManagePermissions == null) return;
        isSavingTabs = true;
        var tabsString = string.Join(",", moderatorTabs);
        
        var claims = await AppUserManager.GetClaimsAsync(userToManagePermissions);
        var oldClaim = claims.FirstOrDefault(c => c.Type == "AllowedTabs");
        if (oldClaim != null)
        {
            await AppUserManager.RemoveClaimAsync(userToManagePermissions, oldClaim);
        }
        
        await AppUserManager.AddClaimAsync(userToManagePermissions, new System.Security.Claims.Claim("AllowedTabs", tabsString));
        
        isSavingTabs = false;
        showTabsSavedMsg = true;
        await Task.Delay(3000);
        showTabsSavedMsg = false;
        StateHasChanged();
    }"""

content = content.replace(old_methods, new_methods)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated UserManager.razor")
